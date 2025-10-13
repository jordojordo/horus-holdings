import type { RecurrencePayload, SimpleRecurrence, WeekendAdjustment, ExpandWindow } from '@server/types/Recurrence';

import { DateTime } from 'luxon';
import { RRuleSet, rrulestr } from 'rrule';

export const pickRecurrence = (body: { recurrence: RecurrencePayload | undefined } | undefined) => ({
  recurrenceKind:    body?.recurrence?.recurrenceKind ?? 'none',
  rrule:             body?.recurrence?.rrule,
  anchorDate:        body?.recurrence?.anchorDate,
  endDate:           body?.recurrence?.endDate,
  count:             body?.recurrence?.count,
  timezone:          body?.recurrence?.timezone,
  weekendAdjustment: body?.recurrence?.weekendAdjustment ?? 'none',
  includeDates:      body?.recurrence?.includeDates,
  excludeDates:      body?.recurrence?.excludeDates,
  simple:            body?.recurrence?.simple
});


function formatDtStart(dateISO: string, tz: string): string {
  // Build local NOON of that civil day, then convert to UTC and mark Z.
  const dt = DateTime.fromISO(dateISO, { zone: tz })
    .set({
      hour: 12, minute: 0, second: 0, millisecond: 0 
    })
    .toUTC();

  return dt.toFormat("yyyyMMdd'T'HHmmss'Z'");
}

function weekdayFromAnchor(anchorISO: string, tz: string): number {
  const dt = DateTime.fromISO(anchorISO, { zone: tz });

  // luxon: 1=Mon .. 7=Sun, RRule uses 0=Mon .. 6=Sun for byweekday? Actually rrule's Weekday enum: 0=MO..6=SU
  // We'll map: Mon(1)->0 ... Sun(7)->6
  return (dt.weekday + 6) % 7;
}

function clampDay(day: number): number {
  if (day < 1) {
    return 1;
  }

  if (day > 31) {
    return 31;
  }

  return day | 0;
}

// Build an iCal text that rrulestr() can parse to a RRuleSet
export function compileSimpleToICal(simple: SimpleRecurrence, anchorISO: string, tz: string, endDate?: string | null, count?: number | null): string {
  const dtstart = formatDtStart(anchorISO, tz);
  const lines: string[] = [`DTSTART:${ dtstart }`];

  const commonTail = ((): string => {
    const parts: string[] = [];

    if (endDate) {
      const until = DateTime.fromISO(endDate, { zone: tz }).endOf('day').toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");

      parts.push(`UNTIL=${ until }`);
    }

    if (count && count > 0) {
      parts.push(`COUNT=${ count }`);
    }

    return parts.length ? ';' + parts.join(';') : '';
  })();

  const pushRule = (rule: string) => lines.push(`RRULE:${ rule }${ commonTail }`);

  switch (simple.type) {
    case 'weekly': {
      const interval = simple.interval && simple.interval > 0 ? simple.interval : 1;
      const days = (simple.daysOfWeek?.length ? simple.daysOfWeek : [weekdayFromAnchor(anchorISO, tz)]);
      const byday = days.map(d => ['SU','MO','TU','WE','TH','FR','SA'][(d+1)%7]).join(',');

      pushRule(`FREQ=WEEKLY;INTERVAL=${ interval };BYDAY=${ byday }`);
      break;
    }
    case 'everyNDays': {
      const n = Math.max(1, simple.n|0);

      pushRule(`FREQ=DAILY;INTERVAL=${ n }`);
      break;
    }
    case 'biweekly': {
      const wd = simple.weekday ?? weekdayFromAnchor(anchorISO, tz);
      const byday = ['SU','MO','TU','WE','TH','FR','SA'][(wd+1)%7];

      pushRule(`FREQ=WEEKLY;INTERVAL=2;BYDAY=${ byday }`);
      break;
    }
    case 'monthlyDay': {
      const day = clampDay(simple.day);

      pushRule(`FREQ=MONTHLY;BYMONTHDAY=${ day }`);
      break;
    }
    case 'monthlyOrdinal': {
      const ord = simple.ordinal; // 1|2|3|4|-1
      const bysetpos = ord;
      const byday = ['SU','MO','TU','WE','TH','FR','SA'][(simple.weekday+1)%7];

      pushRule(`FREQ=MONTHLY;BYDAY=${ byday };BYSETPOS=${ bysetpos }`);
      break;
    }
    case 'semiMonthly': {
      const d1 = clampDay(simple.days[0]);
      const d2 = clampDay(simple.days[1]);

      pushRule(`FREQ=MONTHLY;BYMONTHDAY=${ d1 }`);
      pushRule(`FREQ=MONTHLY;BYMONTHDAY=${ d2 }`);
      break;
    }
    case 'quarterly': {
      const day = clampDay(simple.day);

      pushRule(`FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=${ day }`);
      break;
    }
    case 'semiannual': {
      for (const md of simple.monthDays) {
        const m = Math.min(12, Math.max(1, md.month|0));
        const d = clampDay(md.day);

        pushRule(`FREQ=YEARLY;BYMONTH=${ m };BYMONTHDAY=${ d }`);
      }
      break;
    }
    case 'annual': {
      const m = Math.min(12, Math.max(1, simple.month|0));
      const d = clampDay(simple.day);

      pushRule(`FREQ=YEARLY;BYMONTH=${ m };BYMONTHDAY=${ d }`);
      break;
    }
    case 'customDays': {
      const days = (simple.days || []).map(clampDay);

      if (days.length) {
        pushRule(`FREQ=MONTHLY;BYMONTHDAY=${ days.join(',') }`);
      }

      break;
    }
  }

  return lines.join('\n');
}

function adjustWeekend(dt: DateTime, policy: WeekendAdjustment): DateTime {
  if (policy === 'none') {
    return dt;
  }

  const w = dt.weekday; // 1..7 (Mon..Sun)

  if (w <= 5) {
    return dt; // weekday
  }

  if (policy === 'next') {
    return dt.plus({ days: w === 6 ? 2 : 1 }); // Sat->Mon, Sun->Mon
  }

  if (policy === 'prev') {
    return dt.minus({ days: w === 6 ? 1 : 2 }); // Sat->Fri, Sun->Fri
  }

  // nearest
  if (w === 6) {
    return dt.minus({ days: 1 }); // Sat->Fri
  }

  return dt.plus({ days: 1 }); // Sun->Mon
}

export function expandOccurrences(payload: RecurrencePayload, window: ExpandWindow): (string | null)[] {
  if (payload.recurrenceKind === 'none') {
    const tz = payload.timezone || 'UTC';
    const base = payload.anchorDate;
    const dt = adjustWeekend(
      DateTime.fromISO(base, { zone: tz }).startOf('day'),
      payload.weekendAdjustment || 'none'
    );
    const one = dt.toISODate()!;
    const inc = (payload.includeDates || []).filter(Boolean);
    const exc = new Set((payload.excludeDates || []).filter(Boolean));

    return [one, ...inc].filter(d => d && !exc.has(d) && d >= window.start && d <= window.end);
  }

  const tz = payload.timezone || 'UTC';
  const iCal = payload.recurrenceKind === 'simple' ? compileSimpleToICal(payload.simple!, payload.anchorDate, tz, payload.endDate || undefined, payload.count || undefined) : (payload.rrule || '');

  if (!iCal) {
    return [];
  }

  const set = rrulestr(iCal, { forceset: true }) as RRuleSet;

  const start = DateTime.fromISO(window.start, { zone: 'UTC' }).startOf('day');
  const end   = DateTime.fromISO(window.end,   { zone: 'UTC' }).endOf('day');

  const between = set.between(start.toJSDate(), end.toJSDate(), true);

  const exc = new Set((payload.excludeDates || []).filter(Boolean));
  const inc = (payload.includeDates || []).filter(Boolean);

  // Extract the civil date from UTC directly (no zone conversion here!)
  const rruleDates = between.map(d =>
    DateTime.fromJSDate(d, { zone: 'UTC' }).toISODate()!
  );

  // Combine includes AFTER rrule generation (avoid JS Date rdate() TZ pitfalls)
  const inRange = (d: string) => d >= window.start && d <= window.end;
  const dedup = new Set([...rruleDates, ...inc.filter(inRange)]);
  const baseList = [...dedup].filter(d => !exc.has(d));

  // Apply weekend policy in the user's zone on the civil date
  const adjusted = baseList.map(ymdStr => {
    const local = DateTime.fromISO(ymdStr, { zone: tz }).startOf('day');

    return adjustWeekend(local, payload.weekendAdjustment || 'none').toISODate()!;
  });

  return adjusted;
}

export function nextDueDate(payload: RecurrencePayload, fromISO: string): string | null {
  const tz = payload.timezone || 'UTC';
  const iCal = payload.recurrenceKind === 'simple' ? compileSimpleToICal(payload.simple!, payload.anchorDate, tz, payload.endDate || undefined, payload.count || undefined) : (payload.rrule || '');

  if (!iCal) {
    return null;
  }

  const set = rrulestr(iCal, { forceset: true }) as RRuleSet;
  const after = set.after(DateTime.fromISO(fromISO, { zone: 'UTC' }).toJSDate(), true);

  if (!after) {
    return null;
  }

  // Read the civil date from UTC, THEN adjust in the user's zone
  const ymd = DateTime.fromJSDate(after, { zone: 'UTC' }).toISODate()!;

  return adjustWeekend(DateTime.fromISO(ymd, { zone: tz }).startOf('day'), payload.weekendAdjustment || 'none').toISODate();
}
