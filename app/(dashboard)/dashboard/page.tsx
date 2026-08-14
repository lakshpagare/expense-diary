import { Wallet2, CalendarDays, CalendarRange, TrendingUp, ArrowUpCircle, PiggyBank } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getDashboardSummary,
  getCategoryBreakdown,
  getRecentExpenses,
  getSpendingInsights,
} from "@/lib/data";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { StatCard } from "@/components/dashboard/stat-card";
import { DailySpendingChart } from "@/components/charts/daily-spending-chart";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { BudgetProgressCard } from "@/components/dashboard/budget-progress-card";
import { AddExpenseButton } from "@/components/expenses/add-expense-button";

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

  const insights = await getSpendingInsights(userId, summary, breakdown);
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
            Here&apos;s your spending overview.
          </p>
        </div>
        <AddExpenseButton size="lg" />
      </div>

      {/* Summary cards */}
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

      {/* Chart + Category breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailySpendingChart currency={summary.currency} />
        </div>
        <CategoryBreakdownChart breakdown={breakdown} currency={summary.currency} />
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
          <SpendingInsights insights={insights} />
        </div>
      </div>
    </div>
  );
}
