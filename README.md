# Expense Diary

**Track every rupee. Understand every expense.**

A daily expense diary and personal finance dashboard built with Next.js (App Router), TypeScript, Tailwind CSS, and MongoDB.

## Status: Phases 1–4 complete

- ✅ Phase 1 — Project architecture
- ✅ Phase 2 — Database architecture (Mongoose models: User, Expense, Category, Budget, RecurringExpense)
- ✅ Phase 3 — Authentication (register, login, logout, forgot/reset password, JWT sessions, protected routes)
- ✅ Phase 4 — Dashboard UI (summary cards, daily spending chart, category donut chart, recent expenses, budget progress, spending insights, full responsive sidebar/header shell)
- ⏳ Phase 5 onward — Expense list/search/filter/pagination, Diary, Calendar, Reports, Budgets, Recurring Expenses, Categories management, Settings, Export

The "Add Expense" flow (modal, form, fast entry, category picker) was pulled forward from Phase 5 since the dashboard's Add Expense button needed to be a real, working action rather than a stub.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your own values:
   ```bash
   cp .env.example .env.local
   ```
   - `MONGODB_URI` — a MongoDB connection string (local `mongod`, Docker, or a free MongoDB Atlas cluster)
   - `AUTH_SECRET` — a long random string, e.g. `openssl rand -base64 32`

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000, register an account, and start adding expenses. Default categories (Food, Travel, Shopping, etc.) are seeded automatically on registration.

## Verifying the build

```bash
npm run lint   # ESLint
npm run build  # Full production build + TypeScript check
```

Both currently pass cleanly.

## Tech stack

Next.js App Router · React · TypeScript · Tailwind CSS v4 · MongoDB · Mongoose · Recharts · Lucide React · React Hook Form · Zod · Sonner

## Project structure

```
app/
  (auth)/          login, register, forgot-password, reset-password
  (dashboard)/     dashboard (more routes land in later phases)
  api/             auth, expenses, categories, reports, notifications
components/
  dashboard/       stat cards, recent expenses, budget progress, insights
  charts/          daily spending chart, category breakdown donut
  expenses/        expense modal + context, add-expense button
  forms/           auth forms, expense form
  layout/          sidebar, header, theme toggle, notifications, app shell
  ui/              button, input, select, textarea, card, modal, etc.
lib/               db.ts, auth.ts, utils.ts, validations.ts, data.ts
models/            User, Expense, Category, Budget, RecurringExpense
types/             shared TypeScript types + default categories
```
