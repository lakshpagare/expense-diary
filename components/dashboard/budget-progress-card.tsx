import Link from "next/link";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

export function BudgetProgressCard({
  budget,
  spent,
  currency = "INR",
}: {
  budget: number;
  spent: number;
  currency?: string;
}) {
  if (budget <= 0) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center gap-2">
            <Wallet className="h-4.5 w-4.5 text-brand" />
            <h3 className="text-base font-semibold text-foreground">Monthly Budget</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            You haven&apos;t set a monthly budget yet.
          </p>
          <Link
            href="/budgets"
            className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
          >
            Set a budget →
          </Link>
        </CardContent>
      </Card>
    );
  }

  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const exceeded = spent > budget;
  const warning = pct >= 80 && !exceeded;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          <Wallet className="h-4.5 w-4.5 text-brand" />
          <h3 className="text-base font-semibold text-foreground">Monthly Budget</h3>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(spent, currency)} of {formatCurrency(budget, currency)}
          </span>
          <span
            className={cn(
              "text-sm font-semibold",
              exceeded ? "text-destructive" : warning ? "text-warning" : "text-brand"
            )}
          >
            {pct}%
          </span>
        </div>

        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              exceeded ? "bg-destructive" : warning ? "bg-warning" : "bg-brand"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {exceeded ? (
          <p className="mt-3 text-sm font-medium text-destructive">
            Your monthly budget has been exceeded.
          </p>
        ) : warning ? (
          <p className="mt-3 text-sm font-medium text-warning">
            You&apos;re close to your monthly budget limit.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {formatCurrency(budget - spent, currency)} remaining this month.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
