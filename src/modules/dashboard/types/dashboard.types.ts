export type WeeklySaleDay = {
  date: string;
  day: string;
  sales_count: number;
  total: string;
};

export type WeeklySalesSummary = {
  week_start: string;
  week_end: string;
  sales_count: number;
  total: string;
  days: WeeklySaleDay[];
};

export type YearlySaleMonth = {
  month_number: number;
  month: string;
  sales_count: number;
  total: string;
};

export type YearlySalesSummary = {
  year: number;
  sales_count: number;
  total: string;
  months: YearlySaleMonth[];
};