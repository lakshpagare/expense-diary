"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RecurringExpensesTab } from "@/components/recurring/recurring-expenses-tab";
import { RecurringIncomeTab } from "@/components/recurring/recurring-income-tab";

export default function RecurringExpensesPage() {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Recurring Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track bills, subscriptions, salary, and other repeating income or expenses.
        </p>
      </div>

      <div className="flex gap-1 rounded-xl bg-muted p-1 sm:w-fit">
        <button
          onClick={() => setTab("expenses")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
            tab === "expenses" ? "bg-card text-brand shadow-sm" : "text-muted-foreground"
          )}
        >
          Expenses
        </button>
        <button
          onClick={() => setTab("income")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
            tab === "income" ? "bg-card text-brand shadow-sm" : "text-muted-foreground"
          )}
        >
          Income
        </button>
      </div>

      {tab === "expenses" ? <RecurringExpensesTab /> : <RecurringIncomeTab />}
    </div>
  );
}
