import Link from "next/link";
import { WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { INCOME_CATEGORIES } from "@/types";
import type { IncomeDTO } from "@/types";

const categoryMeta = new Map(INCOME_CATEGORIES.map((c) => [c.name, c]));

export function RecentIncome({
  income,
  currency = "INR",
}: {
  income: IncomeDTO[];
  currency?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Recent Income</h3>
          <Link href="/income">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {income.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <WalletCards className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              You haven&apos;t recorded any income yet.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking your earnings by adding your first income record.
            </p>
          </div>
        ) : (
          <div className="mt-2 divide-y divide-border">
            {income.map((inc) => {
              const meta = categoryMeta.get(inc.category);
              return (
                <Link
                  key={inc._id}
                  href={`/income/${inc._id}`}
                  className="flex items-center gap-3 py-3 -mx-2 rounded-lg px-2 transition-colors hover:bg-muted/50"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${meta?.color ?? "#94a3b8"}20` }}
                  >
                    <CategoryIcon icon={meta?.icon ?? "more-horizontal"} color={meta?.color} className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{inc.source}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {inc.category} · {formatShortDate(inc.date)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-brand">
                      +{formatCurrency(inc.amount, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {inc.incomeType === "one-time" ? "One-time" : "Recurring"}
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
