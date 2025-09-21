import type { RecurrencePayload, SimpleRecurrence, WeekendAdjustment, ExpandWindow } from '@server/types/Recurrence';

import { DateTime } from 'luxon';
import { RRuleSet, rrulestr } from 'rrule';

export const pickRecurrence = (body: { recurrence: RecurrencePayload | undefined } | undefined) => ({
  recurrenceKind:    body?.recurrence?.recurrenceKind ?? 'none',
  rrule:             body?.recurrence?.rrule ?? null,
  anchorDate:        body?.recurrence?.anchorDate ?? null,
  endDate:           body?.recurrence?.endDate ?? null,
  count:             body?.recurrence?.count ?? null,
  timezone:          body?.recurrence?.timezone ?? null,
  weekendAdjustment: body?.recurrence?.weekendAdjustment ?? 'none',
  includeDates:      body?.recurrence?.includeDates ?? null,
  excludeDates:      body?.recurrence?.excludeDates ?? null,
  simple:            body?.recurrence?.simple ?? null
});

// function toLocalMidnight(dateISO: string, tz: string): Date {
//   const dt = DateTime.fromISO(dateISO, { zone: tz }).startOf('day');

//   return dt.toJSDate();
// }

function formatDtStart(dateISO: string, tz: string): string {
  // iCal DTSTART in 'floating' local time (we record tz separately)
  const dt = DateTime.fromISO(dateISO, { zone: tz }).startOf('day');

  // Use local time format without 'Z'
  return dt.toFormat("yyyyMMdd'T'HHmmss");
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
    // One-off on anchorDate (or provided date in includeDates)
    const base = payload.anchorDate;
    const tz = payload.timezone || 'UTC';
    const dt = adjustWeekend(DateTime.fromISO(base, { zone: tz }).startOf('day'), payload.weekendAdjustment || 'none');
    const d = dt.toISODate();
    const list = [d];
    const inc = (payload.includeDates || []).filter(Boolean);
    const exc = new Set((payload.excludeDates || []).filter(Boolean));

    return [...list, ...inc].filter(d0 => d0 ? !exc.has(d0) && d0 >= window.start && d0 <= window.end : undefined);
  }

  const tz = payload.timezone || 'UTC';
  const iCal = payload.recurrenceKind === 'simple'? compileSimpleToICal(payload.simple!, payload.anchorDate, tz, payload.endDate || undefined, payload.count || undefined): (payload.rrule || '');

  if (!iCal) {
    return [];
  }

  // Parse as a set (supports multiple RRULE lines)
  const set = rrulestr(iCal, { forceset: true }) as RRuleSet;

  const start = DateTime.fromISO(window.start, { zone: tz }).startOf('day');
  const end = DateTime.fromISO(window.end, { zone: tz }).endOf('day');

  const between = set.between(start.toJSDate(), end.toJSDate(), true);

  const exc = new Set((payload.excludeDates || []).filter(Boolean));
  const inc = (payload.includeDates || []).filter(Boolean).map(d => DateTime.fromISO(d, { zone: tz }).startOf('day').toJSDate());

  // Add includes as explicit rdates
  for (const d of inc) set.rdate(d);

  const adjusted = between.map(jsd => {
    const local = DateTime.fromJSDate(jsd, { zone: tz }).startOf('day');

    return adjustWeekend(local, payload.weekendAdjustment || 'none').toISODate()!;
  });

  return adjusted.filter(d => !exc.has(d));
}

export function nextDueDate(payload: RecurrencePayload, fromISO: string): string | null {
  const tz = payload.timezone || 'UTC';
  const iCal = payload.recurrenceKind === 'simple'? compileSimpleToICal(payload.simple!, payload.anchorDate, tz, payload.endDate || undefined, payload.count || undefined): (payload.rrule || '');

  if (!iCal) {
    return null;
  }

  const set = rrulestr(iCal, { forceset: true }) as RRuleSet;
  const after = set.after(DateTime.fromISO(fromISO, { zone: tz }).toJSDate(), true);

  if (!after) {
    return null;
  }

  return adjustWeekend(DateTime.fromJSDate(after, { zone: tz }).startOf('day'), payload.weekendAdjustment || 'none').toISODate();
}
