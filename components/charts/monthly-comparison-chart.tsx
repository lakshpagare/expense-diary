"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyComparisonPoint } from "@/lib/data";

export function MonthlyComparisonChart({
  data,
  currency = "INR",
}: {
  data: MonthlyComparisonPoint[];
  currency?: string;
}) {
  const isEmpty = data.every((d) => d.income === 0 && d.expenses === 0);

  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-foreground">Monthly Comparison</h3>
        <div className="mt-4 h-72">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">Not enough data yet to compare months.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value), currency),
                    name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Savings",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 13,
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === "income" ? "Income" : value === "expenses" ? "Expenses" : "Savings"
                  }
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="savings" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
