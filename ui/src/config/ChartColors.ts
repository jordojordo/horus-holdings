/**
 * ChartColors.ts
 * - Pulls colors from CSS custom properties defined in :root / :root.dark
 * - Keeps existing API so buildChartData and components can stay the same
 */

type RGBA = { r: number; g: number; b: number; a?: number };

const FALLBACKS = {
  // your existing hard-coded colors as fallbacks
  inflowBg:   'rgba(44, 182, 125, 0.4)',
  inflowBor:  'rgba(44, 182, 125, 1)',
  outflowBg:  'rgba(255, 127, 80, 0.4)',
  outflowBor: 'rgba(255, 127, 80, 1)',
  forecastBg: 'rgba(137, 101, 246, 0.4)',
  forecastBor:'rgba(137, 101, 246, 1)',
  netBg:      'rgba(74, 144, 226, 0.4)',
  netBor:     'rgba(74, 144, 226, 1)',

  recIncBg:   'rgba(44, 182, 125, 0.4)',
  recIncBor:  'rgba(44, 182, 125, 1)',
  oneIncBg:   'rgba(44, 182, 125, 0.2)',
  oneIncBor:  'rgba(44, 182, 125, 0.6)',
  recExpBg:   'rgba(255, 127, 80, 0.4)',
  recExpBor:  'rgba(255, 127, 80, 1)',
  oneExpBg:   'rgba(255, 127, 80, 0.2)',
  oneExpBor:  'rgba(255, 127, 80, 0.6)',
};

function cssVar(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);

  return v ? v.trim() : null;
}

// Parse #rgb/#rrggbb or rgb/rgba strings to RGBA
function parseColor(input: string): RGBA | null {
  const s = input.trim();

  if (s.startsWith('#')) {
    const hex = s.slice(1);

    if (hex.length === 3) {
      const r = parseInt(hex[0]! + hex[0], 16);
      const g = parseInt(hex[1]! + hex[1], 16);
      const b = parseInt(hex[2]! + hex[2], 16);

      return { r, g, b, a: 1 };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      return { r, g, b, a: 1 };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;

      return { r, g, b, a };
    }

    return null;
  }

  const m = s.match(/rgba?\(([^)]+)\)/i);

  if (m) {
    const parts = m[1]!.split(',').map(p => p.trim());

    if (parts.length >= 3) {
      const [r, g, b] = parts.slice(0, 3).map(v => parseFloat(v));
      const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;

      if (r && g && b && a) {
        return { r, g, b, a };
      }
    }
  }

  return null;
}

function withAlpha(base: string, alpha: number): string {
  // If base is already rgba(...) or #rrggbb – build rgba(...)
  const parsed = parseColor(base);

  if (parsed) {
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
  }

  // If base is a computed color-mix or unsupported format, just return as-is (Chart.js can handle computed rgb strings)
  return base;
}

/** Public helpers (optional to use elsewhere) */
export function getChartToken(tokenName: string, fallback: string): string {
  return cssVar(tokenName) ?? fallback;
}

export function getChartTokenAlpha(tokenName: string, fallback: string, alpha: number): string {
  const raw = cssVar(tokenName) ?? fallback;

  return withAlpha(raw, alpha);
}

/** Mappings from your palette tokens */
const TOKENS = {
  incomeFill:  '--chart-income-fill',
  incomeStroke:'--chart-income-stroke',
  expenseFill: '--chart-expense-fill',
  expenseStroke:'--chart-expense-stroke',
  forecastFill:'--chart-forecast-fill',
  forecastStroke:'--chart-forecast-stroke',
  netFill:     '--chart-net-fill',
  netStroke:   '--chart-net-stroke',

  // Category ramps if needed
  series1: '--chart-series-1',
  series2: '--chart-series-2',
  series3: '--chart-series-3',
  series4: '--chart-series-4',
  series5: '--chart-series-5',
  series6: '--chart-series-6',
};

/**
 * colorConfig
 * Exposes the same shape you already use in buildChartData and components.
 * Each prop is a getter so it re-reads CSS vars when theme changes.
 */
export const colorConfig = {
  inflow: {
    get background() { return getChartToken(TOKENS.incomeFill,  FALLBACKS.inflowBg); },
    get border()     { return getChartToken(TOKENS.incomeStroke, FALLBACKS.inflowBor); },
  },
  outflow: {
    get background() { return getChartToken(TOKENS.expenseFill,  FALLBACKS.outflowBg); },
    get border()     { return getChartToken(TOKENS.expenseStroke, FALLBACKS.outflowBor); },
  },
  forecast: {
    get background() { return getChartToken(TOKENS.forecastFill, FALLBACKS.forecastBg); },
    get border()     { return getChartToken(TOKENS.forecastStroke,FALLBACKS.forecastBor); },
  },
  net: {
    get background() { return getChartToken(TOKENS.netFill,      FALLBACKS.netBg); },
    get border()     { return getChartToken(TOKENS.netStroke,    FALLBACKS.netBor); },
  },

  // Detailed categories (if your UI uses them)
  recurringIncome: {
    get background() { return getChartToken(TOKENS.incomeFill,  FALLBACKS.recIncBg); },
    get border()     { return getChartToken(TOKENS.incomeStroke,FALLBACKS.recIncBor); },
  },
  oneTimeIncome: {
    // slightly softer alpha than recurring
    get background() {
      const base = getChartToken(TOKENS.incomeStroke, FALLBACKS.oneIncBor);

      return withAlpha(base, 0.2);
    },
    get border()     {
      const base = getChartToken(TOKENS.incomeStroke, FALLBACKS.oneIncBor);

      return withAlpha(base, 0.6);
    },
  },
  recurringExpense: {
    get background() { return getChartToken(TOKENS.expenseFill,  FALLBACKS.recExpBg); },
    get border()     { return getChartToken(TOKENS.expenseStroke,FALLBACKS.recExpBor); },
  },
  oneTimeExpense: {
    get background() {
      const base = getChartToken(TOKENS.expenseStroke, FALLBACKS.oneExpBor);

      return withAlpha(base, 0.2);
    },
    get border()     {
      const base = getChartToken(TOKENS.expenseStroke, FALLBACKS.oneExpBor);

      return withAlpha(base, 0.6);
    },
  },

  // Optional categorical array for multi-series charts (bars/pies)
  get categorical(): string[] {
    return [
      cssVar(TOKENS.series1) ?? '#8965F6',
      cssVar(TOKENS.series2) ?? '#4A90E2',
      cssVar(TOKENS.series3) ?? '#2CB67D',
      cssVar(TOKENS.series4) ?? '#FF7F50',
      cssVar(TOKENS.series5) ?? '#744DE2',
      cssVar(TOKENS.series6) ?? '#3C7BC1',
    ];
  },
};
