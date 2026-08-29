import { TrendingDown } from "lucide-react";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  getFinancialOverview,
  getDashboardSummary,
  getMonthlyComparison,
  getExpenseAnalytics,
  getIncomeAnalytics,
  getCategoryBreakdown,
  getIncomeCategoryBreakdown,
} from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { MetricTile } from "@/components/reports/metric-tile";
import { TopItemsList } from "@/components/reports/top-items-list";
import { MonthlyComparisonChart } from "@/components/charts/monthly-comparison-chart";
import { PaymentMethodChart } from "@/components/charts/payment-method-chart";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import { IncomeBreakdownChart } from "@/components/charts/income-breakdown-chart";
import { formatCurrency, cn } from "@/lib/utils";
import { WalletCards } from "lucide-react";

export default async function ReportsPage() {
  const session = await getSession();
  const userId = session!.userId;

  await connectDB();

  const summary = await getDashboardSummary(userId);

  const [
    financialOverview,
    monthlyComparison,
    expenseAnalytics,
    incomeAnalytics,
    expenseBreakdown,
    incomeBreakdown,
  ] = await Promise.all([
    getFinancialOverview(userId, summary.monthTotal),
    getMonthlyComparison(userId, 6),
    getExpenseAnalytics(userId, 6),
    getIncomeAnalytics(userId, 6),
    getCategoryBreakdown(userId),
    getIncomeCategoryBreakdown(userId),
  ]);

  const currency = summary.currency;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete picture of your income, expenses, and savings.
        </p>
      </div>

      {/* Financial Overview */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Financial Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Income"
            amount={financialOverview.totalIncome}
            currency={currency}
            icon={WalletCards}
            changePercent={financialOverview.incomeChangePercent}
          />
          <StatCard
            label="Total Expenses"
            amount={financialOverview.totalExpenses}
            currency={currency}
            icon={TrendingDown}
            changePercent={summary.monthChangePercent}
            iconColor="text-destructive"
            iconBg="bg-destructive/10"
          />
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">Net Savings</p>
              <p
                className={cn(
                  "mt-1.5 text-2xl font-semibold",
                  financialOverview.netSavings >= 0 ? "text-foreground" : "text-destructive"
                )}
              >
                {formatCurrency(financialOverview.netSavings, currency)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="mt-1.5 text-2xl font-semibold text-foreground">
                {financialOverview.savingsRate}%
              </p>
            </CardContent>
          </Card>
        </div>

        <MonthlyComparisonChart data={monthlyComparison} currency={currency} />
      </section>

      {/* Income Analytics */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Income Analytics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricTile label="Total Income" value={formatCurrency(incomeAnalytics.total, currency)} />
          <MetricTile label="Average Income" value={formatCurrency(incomeAnalytics.average, currency)} />
          <MetricTile label="Highest Income" value={formatCurrency(incomeAnalytics.highest, currency)} />
          <MetricTile label="Lowest Income" value={formatCurrency(incomeAnalytics.lowest, currency)} />
          <MetricTile
            label="Income Growth"
            value={
              incomeAnalytics.growthPercent === null
                ? "—"
                : `${incomeAnalytics.growthPercent >= 0 ? "+" : ""}${incomeAnalytics.growthPercent}%`
            }
            valueClassName={
              incomeAnalytics.growthPercent === null
                ? undefined
                : incomeAnalytics.growthPercent >= 0
                  ? "text-brand"
                  : "text-destructive"
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricTile
            label="Recurring Income"
            value={formatCurrency(incomeAnalytics.recurringTotal, currency)}
          />
          <MetricTile
            label="One-time Income"
            value={formatCurrency(incomeAnalytics.oneTimeTotal, currency)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <IncomeBreakdownChart breakdown={incomeBreakdown} currency={currency} />
          <TopItemsList
            title="Top Income Sources"
            items={incomeBreakdown.slice(0, 6).map((b) => ({ label: b.category, amount: b.amount }))}
            emptyText="No income recorded this month yet."
            positive
            currency={currency}
          />
        </div>
      </section>

      {/* Expense Analytics */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Expense Analytics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricTile label="Total Expenses" value={formatCurrency(expenseAnalytics.total, currency)} />
          <MetricTile label="Average Expense" value={formatCurrency(expenseAnalytics.average, currency)} />
          <MetricTile label="Highest Expense" value={formatCurrency(expenseAnalytics.highest, currency)} />
          <MetricTile label="Lowest Expense" value={formatCurrency(expenseAnalytics.lowest, currency)} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryBreakdownChart breakdown={expenseBreakdown} currency={currency} />
          <PaymentMethodChart data={expenseAnalytics.paymentMethodBreakdown} currency={currency} />
        </div>

        <TopItemsList
          title="Top Spending Places"
          items={expenseAnalytics.topPlaces.map((p) => ({ label: p.place, amount: p.amount }))}
          emptyText="No expenses recorded this month yet."
          currency={currency}
        />
      </section>
    </div>
  );
}
