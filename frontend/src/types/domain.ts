import type { User } from "./auth";

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type ExpenseKind = "FIXED" | "VARIABLE";
export type MacroArea =
  | "HOME"
  | "CAR"
  | "SPORT"
  | "FAMILY"
  | "INVESTMENT"
  | "LEISURE"
  | "PERSONAL"
  | "OTHER";
export type FamilyRole = "SELF" | "SPOUSE" | "CHILD" | "PARENT" | "OTHER";
export type HousingType = "OWNED" | "MORTGAGE" | "RENT";
export type EmploymentType =
  | "EMPLOYEE"
  | "FREELANCER"
  | "VAT"
  | "RETIRED"
  | "OTHER";
export type TaxFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type PassiveIncomeType =
  | "RENT"
  | "DIVIDEND"
  | "FUND"
  | "INVESTMENT"
  | "PENSION"
  | "OTHER";

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
  date: string;
  isRecurring: boolean;
  frequency: Frequency;
  utility: UtilityLevel;
  categoryId?: string;
  memberId?: string;
  receiptUrl?: string;
}

export interface Loan {
  id: string;
  name: string;
  description?: string;
  totalAmount: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  categoryId?: string;
  memberId?: string;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: FamilyRole;
  producesIncome: boolean;
  order: number;
}

export interface Housing {
  id: string;
  type: HousingType;
  propertyValue?: number;
  mortgagePayment?: number;
  mortgageYears?: number;
  rentAmount?: number;
}

export interface PassiveIncome {
  id: string;
  type: PassiveIncomeType;
  description: string;
  amount: number;
  frequency: Frequency;
  startDate: string;
}

export interface FullProfile {
  user: User;
  familyMembers: FamilyMember[];
  housing: Housing | null;
  passiveIncomes: PassiveIncome[];
}

export interface Income {
  id: string;
  employmentType: EmploymentType;
  netMonthly: number;
  grossAnnual: number;
  monthlyPaymentsCount: number;
  thirteenthSalary?: number;
  fourteenthSalary?: number;
  annualBonus?: number;
  taxRate?: number;
  taxFrequency?: TaxFrequency;
  taxSetAside?: number;
  memberId?: string;
}

export interface IncomeHistoryEntry {
  id: string;
  netMonthly: number;
  grossAnnual: number;
  monthlyPaymentsCount: number;
  thirteenthSalary?: number;
  fourteenthSalary?: number;
  annualBonus?: number;
  recordedAt: string;
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

export type TrendGranularity = "day" | "month" | "year";

export interface TrendPoint {
  period: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DistributionSlice {
  macroArea: MacroArea;
  amount: number;
}

export type FinancialStability = "STABILE" | "MODERATA" | "FRAGILE" | "CRITICA";

export interface FinancialAnalysis {
  annualIncome: number;
  annualExpenses: number;
  savingsAmount: number;
  savingsRate: number;
  fixedExpenseIncidence: number;
  variableExpenseIncidence: number;
  stability: FinancialStability;
}

export interface Suggestion {
  type: "REDUCE_SUPERFLUOUS" | "REVIEW_SUBSCRIPTION" | "DAILY_IMPACT";
  expenseId: string;
  message: string;
}

export interface HealthScoreBreakdownItem {
  key: string;
  label: string;
  points: number;
  max: number;
}

export interface HealthScore {
  score: number;
  label: string;
  breakdown: HealthScoreBreakdownItem[];
}

export type SimulationAction =
  | { type: "REDUCE_EXPENSE"; expenseId: string; percentage: number }
  | { type: "REMOVE_EXPENSE"; expenseId: string }
  | { type: "INCREASE_INCOME"; amount: number };

export interface SimulationFigures {
  annualIncome: number;
  annualExpenses: number;
  monthlySavings: number;
}

export interface SimulationResult {
  baseline: SimulationFigures;
  projected: SimulationFigures;
  delta: { monthlySavings: number };
  actions: Array<SimulationAction & { name?: string; annualImpact: number }>;
}

export interface Simulation {
  id: string;
  name: string;
  createdAt: string;
  actions: SimulationAction[];
  result: SimulationResult;
}
