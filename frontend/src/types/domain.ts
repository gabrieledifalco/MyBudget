export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type ExpenseKind = 'FIXED' | 'VARIABLE';
export type MacroArea = 'HOME' | 'CAR' | 'SPORT' | 'FAMILY' | 'INVESTMENT' | 'LEISURE' | 'OTHER';
export type FamilyRole = 'SPOUSE' | 'CHILD' | 'PARENT' | 'OTHER';
export type HousingType = 'OWNED' | 'MORTGAGE' | 'RENT';
export type EmploymentType = 'EMPLOYEE' | 'FREELANCER' | 'VAT' | 'RETIRED' | 'OTHER';

/** 1 = superflua ... 5 = essenziale */
export type UtilityLevel = 1 | 2 | 3 | 4 | 5;

export interface Category {
  id: string;
  name: string;
  macroArea: MacroArea;
}

export interface Expense {
  id: string;
  name: string;
  description?: string;
  kind: ExpenseKind;
  amount: number;
  frequency: Frequency;
  utility: UtilityLevel;
  categoryId?: string;
}

export interface Kpi {
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardSummary {
  daily: Kpi;
  monthly: Kpi;
  yearly: Kpi;
}
