"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";

const PERIODS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
];

interface SeriesPoint {
  date: string;
  amount: number;
}

export function DailySpendingChart({ currency = "INR" }: { currency?: string }) {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<{ period: string; series: SeriesPoint[] } | null>(null);
  const loading = !data || data.period !== period;
  const series = data?.period === period ? data.series : [];

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reports/daily-trend?period=${period}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData({ period, series: json.series ?? [] });
      })
      .catch(() => {
        if (!cancelled) setData({ period, series: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">Daily Spending</h3>
          <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  period === p.value
                    ? "bg-card text-brand shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 h-64">
          {loading ? (
            <div className="skeleton h-full w-full rounded-xl" />
          ) : series.every((s) => s.amount === 0) ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No expenses recorded in this period yet.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value), currency), "Spent"]}
                  labelFormatter={(label) => formatShortDate(label as string)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                  animationDuration={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
