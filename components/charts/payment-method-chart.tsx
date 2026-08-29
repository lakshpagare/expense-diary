"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethodBreakdownItem } from "@/lib/data";

const COLORS = ["#059669", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#94a3b8"];

export function PaymentMethodChart({
  data,
  currency = "INR",
}: {
  data: PaymentMethodBreakdownItem[];
  currency?: string;
}) {
  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-foreground">Payment Method Distribution</h3>
        {data.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">No expenses recorded this month yet.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="method"
                    type="category"
                    width={90}
                    tick={{ fontSize: 12, fill: "var(--foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value), currency)}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {data.map((item, i) => (
                <div key={item.method} className="flex items-center gap-2 px-1 py-1 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="flex-1 text-foreground">{item.method}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
