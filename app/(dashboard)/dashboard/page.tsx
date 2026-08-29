import {
  Wallet2,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  ArrowUpCircle,
  PiggyBank,
  WalletCards,
  TrendingDown,
  Percent,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getDashboardSummary,
  getCategoryBreakdown,
  getRecentExpenses,
  getSpendingInsights,
  getFinancialOverview,
  getIncomeCategoryBreakdown,
  getRecentIncome,
  getFinancialInsights,
} from "@/lib/data";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { DailySpendingChart } from "@/components/charts/daily-spending-chart";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import { IncomeVsExpenseChart } from "@/components/charts/income-vs-expense-chart";
import { IncomeBreakdownChart } from "@/components/charts/income-breakdown-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { RecentIncome } from "@/components/dashboard/recent-income";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { BudgetProgressCard } from "@/components/dashboard/budget-progress-card";
import { AddExpenseButton } from "@/components/expenses/add-expense-button";
import { AddIncomeButton } from "@/components/income/add-income-button";
import { formatCurrency } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.userId;

  await connectDB();

  const [summary, breakdown, recent, categories] = await Promise.all([
    getDashboardSummary(userId),
    getCategoryBreakdown(userId),
    getRecentExpenses(userId, 5),
    Category.find({ userId }).lean(),
  ]);

  const [expenseInsights, financialOverview, incomeBreakdown, recentIncome] = await Promise.all([
    getSpendingInsights(userId, summary, breakdown),
    getFinancialOverview(userId, summary.monthTotal),
    getIncomeCategoryBreakdown(userId),
    getRecentIncome(userId, 5),
  ]);

  const insights = await getFinancialInsights(
    userId,
    financialOverview,
    incomeBreakdown,
    expenseInsights
  );

  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {summary.userName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your financial overview.
          </p>
        </div>
        <div className="flex gap-2">
          <AddIncomeButton size="lg" />
          <AddExpenseButton size="lg" />
        </div>
      </div>

      {/* Financial overview: Income, Expenses, Net Savings, Savings Rate */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Income"
          amount={financialOverview.totalIncome}
          currency={summary.currency}
          icon={WalletCards}
          changePercent={financialOverview.incomeChangePercent}
          changeLabel="from last month"
          iconColor="text-brand"
          iconBg="bg-brand-light"
        />
        <StatCard
          label="Total Expenses"
          amount={financialOverview.totalExpenses}
          currency={summary.currency}
          icon={TrendingDown}
          changePercent={summary.monthChangePercent}
          changeLabel="from last month"
          iconColor="text-destructive"
          iconBg="bg-destructive/10"
        />
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Net Savings</p>
            <p
              className={`mt-1.5 truncate text-2xl font-semibold ${
                financialOverview.netSavings >= 0 ? "text-foreground" : "text-destructive"
              }`}
            >
              {formatCurrency(financialOverview.netSavings, summary.currency)}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">Income − Expenses</p>
          </CardContent>
        </Card>
        <StatCardPercent label="Savings Rate" value={financialOverview.savingsRate} icon={Percent} />
      </div>

      {/* Existing expense summary cards - unchanged */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Today's Expense"
          amount={summary.todayTotal}
          currency={summary.currency}
          icon={CalendarDays}
        />
        <StatCard
          label="This Week"
          amount={summary.weekTotal}
          currency={summary.currency}
          icon={CalendarRange}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-950"
        />
        <StatCard
          label="This Month"
          amount={summary.monthTotal}
          currency={summary.currency}
          icon={Wallet2}
          changePercent={summary.monthChangePercent}
          iconColor="text-violet-600"
          iconBg="bg-violet-100 dark:bg-violet-950"
        />
        <StatCard
          label="Average Daily"
          amount={summary.avgDaily}
          currency={summary.currency}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-950"
        />
        <StatCard
          label="Highest Expense"
          amount={summary.highestExpense}
          currency={summary.currency}
          icon={ArrowUpCircle}
          iconColor="text-rose-600"
          iconBg="bg-rose-100 dark:bg-rose-950"
        />
        <StatCard
          label="Remaining Budget"
          amount={Math.max(0, summary.remainingBudget)}
          currency={summary.currency}
          icon={PiggyBank}
        />
      </div>

      {/* Income vs Expenses chart */}
      <IncomeVsExpenseChart currency={summary.currency} />

      {/* Daily spending + Category breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailySpendingChart currency={summary.currency} />
        </div>
        <CategoryBreakdownChart breakdown={breakdown} currency={summary.currency} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IncomeBreakdownChart breakdown={incomeBreakdown} currency={summary.currency} />
        <RecentIncome income={recentIncome} currency={summary.currency} />
      </div>

      {/* Recent expenses + insights/budget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentExpenses expenses={recent} categories={serializedCategories} currency={summary.currency} />
        </div>
        <div className="space-y-6">
          <BudgetProgressCard
            budget={summary.monthlyBudget}
            spent={summary.monthTotal}
            currency={summary.currency}
          />
          <FinancialInsights insights={insights} />
        </div>
      </div>
    </div>
  );
}

function StatCardPercent({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Percent;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-foreground">{value}%</p>
          <p className="mt-1.5 text-xs text-muted-foreground">of income saved</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
          <Icon className="h-5 w-5 text-brand" />
        </div>
      </CardContent>
    </Card>
  );
}
