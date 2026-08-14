"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { BudgetDTO } from "@/types";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState("");

  const loadBudgets = useCallback(async () => {
    try {
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const data = await res.json();
      setBudgets(data.budgets ?? []);
    } catch (err) {
      console.error("Error loading budgets:", err);
      toast.error("Unable to load budgets");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBudgets();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBudgets]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      toast.error("Please enter a budget amount");
      return;
    }

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          amount: Number(amount),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error ?? "Failed to save budget");
        return;
      }

      toast.success("Budget saved successfully");
      setAmount("");
      loadBudgets();
    } catch (err) {
      console.error("Error saving budget:", err);
      toast.error("Unable to save budget");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set and track your monthly budgets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="month">Month</Label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString("en-US", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="amount">Budget Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Save Budget
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No budgets set yet. Create one above.
            </div>
          ) : (
            <div className="space-y-2">
              {budgets.map((budget) => (
                <div
                  key={budget._id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(2000, budget.month - 1).toLocaleString(
                        "en-US",
                        { month: "long" },
                      )}{" "}
                      {budget.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Budget: ₹{budget.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
