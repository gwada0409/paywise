# PayWise — AI-Powered Personal Finance & Payday Tracker

> **"Make Every Payday Count."**

PayWise is a production-ready, mobile-first personal finance management web application designed specifically for working individuals in the Philippines who receive salary semi-monthly (15th and 30th schedules). It accurately computes true spendable cash, divides income into Needs, Wants, and Savings (50/30/20), tracks upcoming bill payment deadlines and loans, and features an intelligent financial assistant powered by **Google Gemini AI**.

---

## 🌟 Key Features

### 1. Semi-Monthly Salary & Payday Tracker (`/salary`)
- **Configurable Payday Schedule**: Defaults to 15th and 30th (or month-end).
- **Intelligent Calendar Clamping**: Automatically adjusts February paydays (28th or 29th during leap years) and 30/31-day months.
- **Unequal Payday Salaries**: Supports custom allocations per cutoff (e.g., ₱10,000 on 15th, ₱20,000 on 30th).
- **Actual vs Expected Separation**: Unreceived salary is never marked as spendable cash until explicitly logged as received.
- **Smart Payday Planner**: Calculates flexible daily spending after reserving upcoming bills and savings targets before the next payday.

### 2. Main Finance Dashboard (`/dashboard`)
- **True Spendable Balance**: Real liquid cash (Cash + GCash + Maya + Bank) minus reserved upcoming unpaid bills.
- **Next Payday Countdown**: Live countdown to the next cutoff date with expected payouts and daily spendable rates.
- **50/30/20 Budget Progress**: Live visual progress indicators for Needs, Wants, and Savings.
- **Automated Threshold Warnings**: Instant alerts when spending hits 80%, 90%, and 100% of budgeted limits.
- **Deterministic & AI Insights**: Instant advice tailored to active account balances.

### 3. Needs, Wants & Savings Budget Manager (`/budget`)
- **Default 50/30/20 Rule**: 50% Needs, 30% Wants, 20% Savings.
- **Custom Percentages**: Interactive editor with strict 100% total validation.
- **View Toggle**: Switch seamlessly between Monthly and Per-Payday budget views.
- **Category Grouping**: Real-time spending breakdowns for Groceries, Rent, Utilities, Dining Out, Shopping, and more.

### 4. Transactions Tracker (`/transactions`)
- **Mobile-First Bottom Sheet**: Fast numeric money entry (`₱`) with category suggestion chips.
- **Payment Methods**: GCash, Maya, Cash on Hand, Bank Transfers, Debit Cards, and Credit Cards.
- **Multi-Filter & Search**: Filter by transaction type, category, or payment account.
- **Reversion on Delete**: Deleting or editing transactions accurately restores account balances.

### 5. Savings Goals (`/savings`)
- **Goal Cards with Progress**: Emergency Fund, Travel Goals, Gadgets, and Investments.
- **Ledger Transfer Isolation**: Deposits and withdrawals move money between liquid accounts and goals without creating fake income or consumption expenses.
- **Milestone Notifications**: Automatic celebrations when savings milestones are achieved.

### 6. Upcoming Bills & Due Dates (`/bills`)
- **View Modes**: Upcoming List, 31-Day Due Date Calendar, and Paid History.
- **Payment Statuses**: Upcoming, Due Soon (≤3 days), Due Today, Overdue, and Paid.
- **One-Click Bill Payment**: Marks bill as paid and logs the expense with zero double-counting.

### 7. Loans & Debt Management (`/loans`)
- **Loan Types**: SSS Salary Loans, Bank Loans, Credit Card Debt, Store Installments.
- **Amortization Engine**: Computes monthly payments, interest vs principal breakdown, and projected debt-free month forecasts.
- **Partial & Full Repayments**: Deducts directly from current balance and updates debt totals.

### 8. Google Gemini AI Assistant (`/ai` & `/settings/ai`)
- **PayWise AI**: Conversational assistant built with the official Google Gen AI SDK (`@google/genai` and `@google/generative-ai`).
- **Financial Context Engine**: Securely constructs a privacy-scoped financial snapshot (spendable cash, days to payday, remaining Wants budget, pending bills) and feeds it to Gemini.
- **Philippine Financial Localization**: Understands *Sahod*, *Ipon*, *Utang*, *Bayarin*, GCash, Maya, Meralco, and replies naturally in English, Filipino, or Taglish.
- **Purchase Affordability Analyzer**: Asks "Can I afford this?" and receives an exact arithmetic breakdown before discretionary purchases.
- **Security & Privacy**: Zero plaintext API keys in client bundles, server-side encryption with AES-256-GCM, and context sharing toggle.

### 9. Reports & Exports (`/reports`)
- **Recharts Analytics**: Interactive category donut chart and budget performance bar charts.
- **CSV Export**: Downloads a detailed CSV statement of all logged transactions.
- **PDF Export**: Generates a clean, printable PDF financial summary via `jspdf`.

### 10. Progressive Web App (PWA)
- **Installable**: Includes `manifest.json`, SVG icon, safe-area inset handling (`pb-safe`), and standalone display mode for iOS and Android.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS variables, dark/light themes
- **Icons**: Lucide React
- **Charts**: Recharts
- **Data Persistence & Auth**: Supabase PostgreSQL + Row Level Security (RLS)
- **AI Integration**: Google Gemini API (`@google/genai` / `@google/generative-ai`)
- **PDF & CSV Generation**: jsPDF
- **Notifications**: Sonner toast notifications
- **Testing**: Vitest unit & integration test runner

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/paywise.git
cd paywise
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your configuration:

```env
# Supabase (Optional for local demo, required for persistent cloud auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google Gemini AI (Server-Side Only - Never prefix with NEXT_PUBLIC_)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Server-side 32-byte AES encryption key for in-app key storage
APP_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 3. Run Database Migrations (Supabase)

The complete SQL schema with Row Level Security (RLS) policies and performance indexes is provided in:
`supabase/migrations/20261020000001_paywise_schema.sql`

You can run this migration directly in the **Supabase SQL Editor** or via the Supabase CLI:

```bash
supabase db push
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile or desktop browser.

---

## 🧪 Running Automated Tests

All financial calculation suites (payday leap-year clamping, 50/30/20 allocations, cash balance reservations, loan amortization, and AI affordability checks) are covered by automated unit tests:

```bash
npm test
```

---

## 📱 Mobile-First Experience & PWA

PayWise is designed with a strict mobile-first architecture:
- **Bottom Navigation**: 5 thumb-friendly tabs (Home, Activity, Budget, AI Chat, More).
- **Comfortable Touch Targets**: Minimum 44px on all buttons and inputs.
- **Safe Area Inset Handling**: Automatically respects mobile notches and home indicators.
- **Install as App**: Open in Chrome on Android or Safari on iOS and tap **"Add to Home Screen"** to run PayWise as a standalone native-feeling PWA.

---

## 📄 License

MIT License. Built for individuals and families to take control of their semi-monthly paydays.
