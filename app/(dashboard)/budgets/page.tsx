import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";
import {
  getDashboardSummary,
  getFinancialOverview,
  getBudgetHistory,
} from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetProgressCard } from "@/components/dashboard/budget-progress-card";
import { BudgetForm } from "@/components/budgets/budget-form";
import { BudgetHistoryTable } from "@/components/budgets/budget-history-table";
import { formatCurrency } from "@/lib/utils";

export default async function BudgetsPage() {
  const session = await getSession();
  const userId = session!.userId;

  await connectDB();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [summary, budgetDoc, history] = await Promise.all([
    getDashboardSummary(userId),
    Budget.findOne({ userId, month, year }).lean(),
    getBudgetHistory(userId, 6),
  ]);

  const financialOverview = await getFinancialOverview(userId, summary.monthTotal);
  const currentBudget = budgetDoc?.amount ?? summary.monthlyBudget ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set a monthly spending limit and track how you&apos;re doing against it.
        </p>
      </div>

      <Card>
        <CardContent>
          <h2 className="text-base font-semibold text-foreground">This Month&apos;s Budget</h2>
          <div className="mt-3">
            <BudgetForm month={month} year={year} currentAmount={currentBudget} />
          </div>
        </CardContent>
      </Card>

      <BudgetProgressCard
        budget={currentBudget}
        spent={summary.monthTotal}
        currency={summary.currency}
      />

      {/* Budget + Income integration */}
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold text-foreground">Financial Snapshot</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Monthly Income</p>
              <p className="mt-1 text-lg font-semibold text-brand">
                {formatCurrency(financialOverview.totalIncome, summary.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Budget</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {currentBudget > 0 ? formatCurrency(currentBudget, summary.currency) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="mt-1 text-lg font-semibold text-destructive">
                {formatCurrency(summary.monthTotal, summary.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Savings</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(financialOverview.netSavings, summary.currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <BudgetHistoryTable history={history} />
    </div>
  );
}
