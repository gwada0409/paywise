-- ==============================================================================
-- PayWise Database Schema Migration
-- Designed for Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    currency TEXT NOT NULL DEFAULT 'PHP',
    theme TEXT NOT NULL DEFAULT 'system',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Salary & Payday Settings
CREATE TABLE IF NOT EXISTS public.salary_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    monthly_net NUMERIC(12,2) NOT NULL DEFAULT 30000.00,
    payday_1_day INT NOT NULL DEFAULT 15 CHECK (payday_1_day BETWEEN 1 AND 31),
    payday_2_day INT NOT NULL DEFAULT 30 CHECK (payday_2_day BETWEEN 1 AND 31),
    payday_1_expected NUMERIC(12,2) NOT NULL DEFAULT 15000.00,
    payday_2_expected NUMERIC(12,2) NOT NULL DEFAULT 15000.00,
    is_semi_monthly BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Budget Rules (Needs, Wants, Savings percentage split)
CREATE TABLE IF NOT EXISTS public.budget_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    needs_percent NUMERIC(5,2) NOT NULL DEFAULT 50.00 CHECK (needs_percent >= 0),
    wants_percent NUMERIC(5,2) NOT NULL DEFAULT 30.00 CHECK (wants_percent >= 0),
    savings_percent NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (savings_percent >= 0),
    alert_threshold_80 BOOLEAN NOT NULL DEFAULT true,
    alert_threshold_90 BOOLEAN NOT NULL DEFAULT true,
    alert_threshold_100 BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sum_percentages_100 CHECK ((needs_percent + wants_percent + savings_percent) = 100.00)
);

-- 4. Financial Accounts (Cash, GCash, Maya, Bank accounts, Cards)
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'gcash', 'maya', 'bank', 'credit_card', 'other')),
    balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Income Records
CREATE TABLE IF NOT EXISTS public.income_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    payday_period TEXT CHECK (payday_period IN ('payday_1', 'payday_2', 'bonus', 'other')),
    type TEXT NOT NULL DEFAULT 'salary' CHECK (type IN ('salary', 'bonus', 'overtime', 'side_hustle', 'other')),
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Financial Transactions (Ledger for spending and transfers)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'need', 'want', 'savings_transfer', 'loan_payment', 'bill_payment', 'account_transfer')),
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'gcash', 'maya', 'bank', 'debit_card', 'credit_card', 'other')),
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    payday_period TEXT CHECK (payday_period IN ('payday_1', 'payday_2', 'bonus', 'other')),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Savings Goals
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    target_date DATE,
    color TEXT NOT NULL DEFAULT 'emerald',
    icon TEXT NOT NULL DEFAULT 'piggy-bank',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Savings Movements (Deposits/Withdrawals)
CREATE TABLE IF NOT EXISTS public.savings_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Bills and Due Dates
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    recurrence TEXT NOT NULL DEFAULT 'monthly' CHECK (recurrence IN ('one_time', 'weekly', 'monthly', 'yearly')),
    category TEXT NOT NULL,
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due_soon', 'due_today', 'overdue', 'partially_paid', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Bill Payments
CREATE TABLE IF NOT EXISTS public.bill_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    paid_date DATE NOT NULL,
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Loans and Debts
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lender TEXT NOT NULL,
    principal NUMERIC(12,2) NOT NULL CHECK (principal > 0),
    current_balance NUMERIC(12,2) NOT NULL CHECK (current_balance >= 0),
    interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    interest_type TEXT NOT NULL DEFAULT 'fixed' CHECK (interest_type IN ('fixed', 'reducing', 'zero')),
    start_date DATE,
    maturity_date DATE,
    monthly_payment NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    next_due_date DATE,
    payment_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (payment_frequency IN ('weekly', 'bi_weekly', 'monthly')),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Loan Payments
CREATE TABLE IF NOT EXISTS public.loan_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    principal_applied NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    interest_applied NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Notifications Center
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payday', 'salary', 'bill_due', 'bill_overdue', 'loan_due', 'budget_warning', 'savings_milestone', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. AI Assistant Preferences
CREATE TABLE IF NOT EXISTS public.ai_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    model_name TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    share_financial_context BOOLEAN NOT NULL DEFAULT true,
    temperature NUMERIC(3,2) NOT NULL DEFAULT 0.70,
    daily_request_limit INT NOT NULL DEFAULT 50,
    requests_today INT NOT NULL DEFAULT 0,
    last_request_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Encrypted AI Credentials (Server encrypted runtime API keys)
CREATE TABLE IF NOT EXISTS public.encrypted_ai_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    encrypted_api_key TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    masked_key TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. AI Chat Conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Financial Discussion',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. AI Chat Messages
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_ai_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & modify only their own profile
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Salary Settings
CREATE POLICY "Users can manage own salary settings" ON public.salary_settings
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Budget Rules
CREATE POLICY "Users can manage own budget rules" ON public.budget_rules
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Accounts
CREATE POLICY "Users can manage own financial accounts" ON public.financial_accounts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Income Records
CREATE POLICY "Users can manage own income records" ON public.income_records
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can manage own transactions" ON public.financial_transactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Savings Goals & Movements
CREATE POLICY "Users can manage own savings goals" ON public.savings_goals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own savings movements" ON public.savings_movements
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bills & Bill Payments
CREATE POLICY "Users can manage own bills" ON public.bills
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own bill payments" ON public.bill_payments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Loans & Loan Payments
CREATE POLICY "Users can manage own loans" ON public.loans
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own loan payments" ON public.loan_payments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI Preferences & Credentials
CREATE POLICY "Users can manage own ai preferences" ON public.ai_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own encrypted ai credentials" ON public.encrypted_ai_credentials
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI Conversations & Messages
CREATE POLICY "Users can manage own ai conversations" ON public.ai_conversations
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai messages" ON public.ai_messages
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.financial_transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.financial_transactions (user_id, type);
CREATE INDEX IF NOT EXISTS idx_bills_user_due ON public.bills (user_id, due_day);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages (conversation_id, created_at ASC);
