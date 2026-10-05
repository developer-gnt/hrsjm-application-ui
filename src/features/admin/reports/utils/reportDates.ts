import type { DatePresetKey, DateRangePreset } from '../types/reports.types';

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const getDatePresets = (): DateRangePreset[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // 1. THIS MONTH
  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0);

  // 2. LAST MONTH
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);

  // 3. THIS QUARTER (Indian Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar)
  let qStartMonth = 0;
  if (month >= 3 && month <= 5) qStartMonth = 3;
  else if (month >= 6 && month <= 8) qStartMonth = 6;
  else if (month >= 9 && month <= 11) qStartMonth = 9;
  else qStartMonth = 0;
  const thisQuarterStart = new Date(year, qStartMonth, 1);
  const thisQuarterEnd = new Date(year, qStartMonth + 3, 0);

  // 4. THIS FINANCIAL YEAR (Apr 1 - Mar 31)
  const isAfterApr = month >= 3;
  const fyStartYear = isAfterApr ? year : year - 1;
  const fyEndYear = fyStartYear + 1;
  const thisFyStart = new Date(fyStartYear, 3, 1);
  const thisFyEnd = new Date(fyEndYear, 2, 31);

  // 5. LAST FINANCIAL YEAR
  const lastFyStart = new Date(fyStartYear - 1, 3, 1);
  const lastFyEnd = new Date(fyStartYear, 2, 31);

  return [
    {
      key: 'THIS_MONTH',
      label: 'This Month',
      startDate: formatDate(thisMonthStart),
      endDate: formatDate(thisMonthEnd),
      asOfDate: formatDate(thisMonthEnd),
    },
    {
      key: 'LAST_MONTH',
      label: 'Last Month',
      startDate: formatDate(lastMonthStart),
      endDate: formatDate(lastMonthEnd),
      asOfDate: formatDate(lastMonthEnd),
    },
    {
      key: 'THIS_QUARTER',
      label: 'This Quarter',
      startDate: formatDate(thisQuarterStart),
      endDate: formatDate(thisQuarterEnd),
      asOfDate: formatDate(thisQuarterEnd),
    },
    {
      key: 'THIS_FY',
      label: `FY ${fyStartYear}-${fyEndYear.toString().slice(2)}`,
      startDate: formatDate(thisFyStart),
      endDate: formatDate(thisFyEnd),
      asOfDate: formatDate(thisFyEnd),
    },
    {
      key: 'LAST_FY',
      label: `FY ${fyStartYear - 1}-${fyStartYear.toString().slice(2)}`,
      startDate: formatDate(lastFyStart),
      endDate: formatDate(lastFyEnd),
      asOfDate: formatDate(lastFyEnd),
    },
  ];
};

export const getDefaultDatePreset = (): DateRangePreset => {
  const presets = getDatePresets();
  return presets[0]; // THIS_MONTH
};
