import Link from "next/link";
import { Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { ExpenseDTO, CategoryDTO } from "@/types";

export function RecentExpenses({
  expenses,
  categories,
  currency = "INR",
}: {
  expenses: ExpenseDTO[];
  categories: CategoryDTO[];
  currency?: string;
}) {
  const catMeta = new Map(categories.map((c) => [c.name, c]));

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Recent Expenses
          </h3>
          <Link href="/expenses">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No expenses found.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking your spending by adding your first expense.
            </p>
          </div>
        ) : (
          <div className="mt-2 divide-y divide-border">
            {expenses.map((e) => {
              const meta = catMeta.get(e.category);
              return (
                <Link
                  key={e._id}
                  href={`/expenses/${e._id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/50 -mx-2 px-2 rounded-lg"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${meta?.color ?? "#94a3b8"}20` }}
                  >
                    <CategoryIcon
                      icon={meta?.icon ?? "more-horizontal"}
                      color={meta?.color}
                      className="h-4.5 w-4.5"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.category}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.place ? `${e.place} · ` : ""}
                      {formatShortDate(e.date)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(e.amount, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {e.paymentMethod}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
