import type { Dayjs } from 'dayjs';
import type {
  FinancialItem,
  WeekendAdjustment,
  SimpleRecurrence,
} from '@/types';

import dayjs from 'dayjs';
import { RRuleSet, rrulestr } from 'rrule';

const MAX_OCCURRENCES_PER_ITEM = 5000;

function weekday(dt: Dayjs): number {
  // 0=Sun..6=Sat (dayjs)
  return dt.day();
}

function clampDay(day: number): number {
  if (!Number.isFinite(day)) {
    return 1;
  }
  if (day < 1) {
    return 1;
  }
  if (day > 31) {
    return 31;
  }

  return Math.floor(day);
}

function weekdayFromISO(iso: string | null | undefined): number {
  // 0=Sun..6=Sat
  if (!iso) {
    return 1; // default Mon
  }

  const d = dayjs(iso);

  return d.day();
}

function bydayString(wd: number): string | undefined {
  // rrule weekday codes: SU,MO,TU,WE,TH,FR,SA
  return ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][((wd % 7) + 7) % 7];
}

function adjustWeekend(iso: string, policy: WeekendAdjustment | undefined): string {
  const p = policy || 'none';

  if (p === 'none') {
    return iso;
  }

  let d = dayjs(iso);
  const w = weekday(d); // 0=Sun..6=Sat

  // weekday (Mon..Fri)
  if (w >= 1 && w <= 5) {
    return iso;
  }

  if (p === 'next') {
    if (w === 6) {
      d = d.add(2, 'day'); // Sat -> Mon
    } else if (w === 0) {
      d = d.add(1, 'day'); // Sun -> Mon
    }

    return d.format('YYYY-MM-DD');
  }
  if (p === 'prev') {
    if (w === 6) {
      d = d.subtract(1, 'day'); // Sat -> Fri
    } else if (w === 0) {
      d = d.subtract(2, 'day'); // Sun -> Fri
    }

    return d.format('YYYY-MM-DD');
  }

  // nearest
  if (w === 6) {
    return d.subtract(1, 'day').format('YYYY-MM-DD'); // Sat -> Fri
  }

  return d.add(1, 'day').format('YYYY-MM-DD'); // Sun -> Mon
}

/**
 * Builds a minimal iCal text for RRULE parsing.
 * - Write DTSTART as “floating” local midnight (no Z) for UI preview/aggregation.
 * - Append one or more RRULE lines.
 * - Append UNTIL/COUNT when provided.
 */
function compileSimpleToICal(
  simple: SimpleRecurrence,
  anchorISO: string,
  endDate?: string | null,
  count?: number | null
): string {
  const dtstart = dayjs(anchorISO).startOf('day').format('YYYYMMDD[T]HHmmss');
  const lines: string[] = [`DTSTART:${ dtstart }`];

  const tail = (() => {
    const parts: string[] = [];

    if (endDate) {
      // RFC UNTIL is UTC—here, fake by using end-of-day local tagged as 'Z' (good enough for UI bucketing).
      const until = dayjs(endDate)
        .endOf('day')
        // .utc()
        .format('YYYYMMDD[T]HHmmss[Z]');

      parts.push(`UNTIL=${ until }`);
    }
    if (count && count > 0) {
      parts.push(`COUNT=${ count }`);
    }

    return parts.length ? `;${ parts.join(';') }` : '';
  })();

  const pushRule = (rule: string) => lines.push(`RRULE:${ rule }${ tail }`);

  switch (simple.type) {
    case 'weekly': {
      const interval =
        simple.interval && simple.interval > 0 ? simple.interval : 1;
      const days =
        simple.daysOfWeek && simple.daysOfWeek.length ? simple.daysOfWeek : [weekdayFromISO(anchorISO)];
      const byday = days.map(bydayString).join(',');

      pushRule(`FREQ=WEEKLY;INTERVAL=${ interval };BYDAY=${ byday }`);
      break;
    }
    case 'everyNDays': {
      const n = Math.max(1, simple.n | 0);

      pushRule(`FREQ=DAILY;INTERVAL=${ n }`);
      break;
    }
    case 'biweekly': {
      const wd = Number.isInteger(simple.weekday) ? (simple.weekday as number) : weekdayFromISO(anchorISO);

      pushRule(`FREQ=WEEKLY;INTERVAL=2;BYDAY=${ bydayString(wd) }`);
      break;
    }
    case 'monthlyDay': {
      const d = clampDay(simple.day);

      pushRule(`FREQ=MONTHLY;BYMONTHDAY=${ d }`);
      break;
    }
    case 'monthlyOrdinal': {
      const ord = simple.ordinal; // 1|2|3|4|-1
      const byday = bydayString(simple.weekday);

      pushRule(`FREQ=MONTHLY;BYDAY=${ byday };BYSETPOS=${ ord }`);
      break;
    }
    case 'semiMonthly': {
      const [d1, d2] = [clampDay(simple.days[0]), clampDay(simple.days[1])];

      pushRule(`FREQ=MONTHLY;BYMONTHDAY=${ d1 }`);
      pushRule(`FREQ=MONTHLY;BYMONTHDAY=${ d2 }`);
      break;
    }
    case 'quarterly': {
      const d = clampDay(simple.day);

      pushRule(`FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=${ d }`);
      break;
    }
    case 'semiannual': {
      for (const md of simple.monthDays) {
        const m = Math.min(12, Math.max(1, md.month | 0));
        const d = clampDay(md.day);

        pushRule(`FREQ=YEARLY;BYMONTH=${ m };BYMONTHDAY=${ d }`);
      }
      break;
    }
    case 'annual': {
      const m = Math.min(12, Math.max(1, simple.month | 0));
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

function ensureICalForItem(item: FinancialItem): string {
  const kind = item.recurrenceKind ?? 'none';

  if (kind === 'rrule') {
    // If RRULE string already includes DTSTART, use as-is, otherwise prepend a DTSTART built from anchor.
    const trimmed = (item.rrule || '').trim();

    if (!trimmed) {
      return '';
    }
    const hasDtstart = /DTSTART/i.test(trimmed);

    if (hasDtstart) {
      return trimmed;
    }
    if (item.anchorDate) {
      const dtstart = dayjs(item.anchorDate)
        .startOf('day')
        .format('YYYYMMDD[T]HHmmss');

      return `DTSTART:${ dtstart }\n${ trimmed }`;
    }

    return trimmed;
  }

  if (kind === 'simple') {
    if (!item.anchorDate || !item.simple) {
      return '';
    }

    return compileSimpleToICal(
      item.simple,
      item.anchorDate,
      item.endDate ?? null,
      item.count ?? null
    );
  }

  return ''; // kind 'none' handled separately
}

export function expandOccurrencesFromItem(
  item: FinancialItem,
  windowStartISO: string,
  windowEndISO: string
): string[] {
  const kind = item.recurrenceKind ?? 'none';

  // One-off
  if (kind === 'none') {
    const base = item.date || item.anchorDate;

    if (!base) {
      return [];
    }
    const adj = adjustWeekend(
      dayjs(base).format('YYYY-MM-DD'),
      item.weekendAdjustment
    );

    return adj >= windowStartISO && adj <= windowEndISO ? [adj] : [];
  }

  // Build iCal text for 'simple' or 'rrule'
  const ical = ensureICalForItem(item);
  const set = ical ? (rrulestr(ical, { forceset: true }) as RRuleSet) : new RRuleSet();

  // Include explicit dates
  const includes = (item.includeDates || [])
    .filter(Boolean)
    .map((d) => dayjs(d).startOf('day').toDate());

  includes.forEach((d) => set.rdate(d));

  // Exclusions
  const excludeSet = new Set((item.excludeDates || []).filter(Boolean));

  // Window
  const start = dayjs(windowStartISO).startOf('day').toDate();
  const end = dayjs(windowEndISO).endOf('day').toDate();

  // Cap iteration using the iterator callback (correct rrule signature)
  const hardCap = Math.max(1, Math.min(MAX_OCCURRENCES_PER_ITEM, 50000));
  const betweenRaw = set.between(start, end, true, (_d, len) => len < hardCap);

  // Adjust weekends and filter excludes
  const adjusted = betweenRaw.map((jsDate) => adjustWeekend(dayjs(jsDate).format('YYYY-MM-DD'), item.weekendAdjustment));

  return adjusted.filter((d) => !excludeSet.has(d));
}
