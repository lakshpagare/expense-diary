import { Suspense } from "react";
import { ExpenseList } from "@/components/expenses/expense-list";

export default function ExpensesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">All Expenses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every expense you&apos;ve logged, searchable and filterable.
        </p>
      </div>

      <Suspense fallback={<ExpensesListSkeleton />}>
        <ExpenseList />
      </Suspense>
    </div>
  );
}

function ExpensesListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-16 rounded-xl" />
      ))}
    </div>
  );
}
