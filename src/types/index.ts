// ==============================================================================
// PayWise Core Types & Interfaces
// ==============================================================================

export type Currency = 'PHP' | 'USD';

export type PaymentMethod =
  | 'cash'
  | 'gcash'
  | 'maya'
  | 'bank'
  | 'debit_card'
  | 'credit_card'
  | 'other';

export type AccountType =
  | 'cash'
  | 'gcash'
  | 'maya'
  | 'bank'
  | 'credit_card'
  | 'other';

export interface FinancialAccount {
  id: string;
  user_id?: string;
  name: string;
  type: AccountType;
  balance: number;
  is_default?: boolean;
  is_archived?: boolean;
  created_at?: string;
}

export type PaydayPeriod = 'payday_1' | 'payday_2' | 'bonus' | 'other';

export interface SalarySettings {
  id?: string;
  user_id?: string;
  monthly_net: number;
  payday_1_day: number; // e.g. 15
  payday_2_day: number; // e.g. 30
  payday_1_expected: number;
  payday_2_expected: number;
  is_semi_monthly: boolean;
  updated_at?: string;
}

export interface IncomeRecord {
  id: string;
  user_id?: string;
  amount: number;
  date: string; // ISO date YYYY-MM-DD
  payday_period: PaydayPeriod;
  type: 'salary' | 'bonus' | 'overtime' | 'side_hustle' | 'other';
  account_id?: string;
  notes?: string;
  created_at?: string;
}

export type TransactionType =
  | 'income'
  | 'need'
  | 'want'
  | 'savings_transfer'
  | 'loan_payment'
  | 'bill_payment'
  | 'account_transfer';

export type NeedCategory =
  | 'Rent'
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Groceries'
  | 'Transportation'
  | 'Healthcare'
  | 'Insurance'
  | 'Family Support'
  | 'Loan Payments'
  | 'Other Needs';

export type WantCategory =
  | 'Dining Out'
  | 'Entertainment'
  | 'Online Shopping'
  | 'Gaming'
  | 'Subscriptions'
  | 'Travel'
  | 'Hobbies'
  | 'Gadgets'
  | 'Other Wants';

export type SavingsCategory =
  | 'Emergency Fund'
  | 'General Savings'
  | 'Travel Savings'
  | 'Gadget Savings'
  | 'Investment Fund'
  | 'Other Goals';

export interface FinancialTransaction {
  id: string;
  user_id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  payment_method: PaymentMethod;
  account_id?: string;
  payday_period?: PaydayPeriod;
  date: string; // YYYY-MM-DD
  notes?: string;
  created_at?: string;
}

export type BudgetPreset =
  | '50/20/20/10'
  | '60/15/15/10'
  | '40/20/20/20'
  | '40/20/30/10'
  | '50/30/20'
  | '60/20/20'
  | '70/20/10'
  | '40/30/30'
  | 'custom';

export interface CategoryAllocationItem {
  category: string;
  type: 'need' | 'want';
  allocated_monthly: number;
}

export interface BudgetRules {
  id?: string;
  user_id?: string;
  preset_name?: BudgetPreset;
  needs_percent: number; // e.g. 50
  wants_percent: number; // e.g. 20
  savings_percent: number; // e.g. 20
  debt_percent?: number; // e.g. 10 (4th pillar: Debt / Loan Repayment / Investments)
  fourth_pillar_name?: string; // e.g. "Debt & Loans" (default) or "Investments & Wealth"
  category_allocations?: Record<string, number>; // category -> monthly PHP budget
  alert_threshold_80?: boolean;
  alert_threshold_90?: boolean;
  alert_threshold_100?: boolean;
  updated_at?: string;
}

export interface BudgetSummary {
  allocated_needs: number;
  allocated_wants: number;
  allocated_savings: number;
  allocated_debt: number;
  spent_needs: number;
  spent_wants: number;
  saved_amount: number;
  spent_debt: number;
  remaining_needs: number;
  remaining_wants: number;
  remaining_savings: number;
  remaining_debt: number;
  percent_needs: number;
  percent_wants: number;
  percent_savings: number;
  percent_debt: number;
}

export interface SavingsGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string; // YYYY-MM-DD
  color: string;
  icon: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavingsMovement {
  id: string;
  user_id?: string;
  goal_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  account_id?: string;
  date: string;
  notes?: string;
  created_at?: string;
}

export type BillRecurrence = 'one_time' | 'weekly' | 'monthly' | 'yearly';
export type BillStatus =
  | 'upcoming'
  | 'due_soon'
  | 'due_today'
  | 'overdue'
  | 'partially_paid'
  | 'paid';

export interface Bill {
  id: string;
  user_id?: string;
  name: string;
  amount: number;
  due_day: number; // 1-31
  recurrence: BillRecurrence;
  category: string;
  account_id?: string;
  status: BillStatus;
  notes?: string;
  created_at?: string;
}

export interface BillPayment {
  id: string;
  user_id?: string;
  bill_id: string;
  amount: number;
  paid_date: string;
  account_id?: string;
  notes?: string;
  created_at?: string;
}

export interface Loan {
  id: string;
  user_id?: string;
  name: string;
  lender: string;
  principal: number;
  current_balance: number;
  interest_rate: number; // annual percentage e.g. 5.5%
  interest_type: 'fixed' | 'reducing' | 'zero';
  start_date?: string;
  maturity_date?: string;
  monthly_payment: number;
  next_due_date?: string;
  payment_frequency: 'weekly' | 'bi_weekly' | 'monthly';
  is_archived?: boolean;
  notes?: string;
  created_at?: string;
}

export interface LoanPayment {
  id: string;
  user_id?: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  principal_applied?: number;
  interest_applied?: number;
  notes?: string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type:
    | 'payday'
    | 'salary'
    | 'bill_due'
    | 'bill_overdue'
    | 'loan_due'
    | 'budget_warning'
    | 'savings_milestone'
    | 'system';
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// AI Assistant & Settings
export interface AIPreferences {
  id?: string;
  user_id?: string;
  is_enabled: boolean;
  model_name: string;
  share_financial_context: boolean;
  temperature: number;
  daily_request_limit: number;
  requests_today?: number;
  last_request_date?: string;
  updated_at?: string;
}

export interface AIConversation {
  id: string;
  user_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context_snapshot?: FinancialContextSummary;
  created_at: string;
}

export interface FinancialContextSummary {
  currency: string;
  timestamp: string;
  monthly_expected_salary: number;
  monthly_income_received: number;
  total_cash_liquid_balance: number;
  available_spendable_balance: number;
  needs_spent: number;
  wants_spent: number;
  savings_total: number;
  upcoming_unpaid_bills_total: number;
  upcoming_bills_count: number;
  outstanding_debt_total: number;
  next_payday_date: string;
  days_until_next_payday: number;
  current_payday_period: string;
  budget_needs_remaining: number;
  budget_wants_remaining: number;
  recent_expenses: Array<{
    title: string;
    amount: number;
    category: string;
    date: string;
  }>;
  upcoming_bills: Array<{
    name: string;
    amount: number;
    due_day: number;
    status: string;
  }>;
}

export interface AffordabilityAnalysis {
  purchase_name: string;
  purchase_amount: number;
  can_afford: boolean;
  available_cash: number;
  upcoming_bills_before_payday: number;
  cash_after_bills: number;
  cash_after_purchase_and_bills: number;
  wants_budget_remaining: number;
  wants_budget_after_purchase: number;
  verdict: 'safe' | 'caution' | 'not_recommended';
  reasoning: string;
  recommendations: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  currency: Currency;
  theme: 'light' | 'dark' | 'system';
  onboarding_completed: boolean;
}
