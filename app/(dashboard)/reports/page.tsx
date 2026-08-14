"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailySpendingChart } from "@/components/charts/daily-spending-chart";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";

export default function ReportsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze your spending patterns and trends
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Time Period
        </label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 sm:w-48"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="3m">Last 3 months</option>
          <option value="6m">Last 6 months</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <DailySpendingChart period={period} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBreakdownChart />
        </CardContent>
      </Card>
    </div>
  );
}
