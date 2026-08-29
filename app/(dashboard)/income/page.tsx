import { Suspense } from "react";
import { IncomeList } from "@/components/income/income-list";

export default function IncomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Income</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and track all your income.
        </p>
      </div>

      <Suspense fallback={<IncomeListSkeleton />}>
        <IncomeList />
      </Suspense>
    </div>
  );
}

function IncomeListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-16 rounded-xl" />
      ))}
    </div>
  );
}
