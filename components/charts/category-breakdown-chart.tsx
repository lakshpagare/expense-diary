"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency } from "@/lib/utils";
import type { CategoryBreakdownItem } from "@/lib/data";

export function CategoryBreakdownChart({
  breakdown,
  currency = "INR",
}: {
  breakdown: CategoryBreakdownItem[];
  currency?: string;
}) {
  const router = useRouter();

  const goToCategory = (category: string) => {
    router.push(`/expenses?category=${encodeURIComponent(category)}`);
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-foreground">Category Breakdown</h3>

        {breakdown.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              No expenses recorded this month yet.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    animationDuration={500}
                    onClick={(data: unknown) => {
                      const entry = data as { category?: string };
                      if (entry?.category) goToCategory(entry.category);
                    }}
                    className="cursor-pointer"
                  >
                    {breakdown.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value), currency)}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1">
              {breakdown.slice(0, 8).map((item) => (
                <button
                  key={item.category}
                  onClick={() => goToCategory(item.category)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <CategoryIcon icon={item.icon} color={item.color} className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {item.category}
                  </span>
                  <span className="shrink-0 text-sm font-medium text-foreground">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                    {item.percentage}%
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
