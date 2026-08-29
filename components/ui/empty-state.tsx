import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AddExpenseButton } from "@/components/expenses/add-expense-button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  showAddExpense = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  showAddExpense?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="mt-4 text-base font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {showAddExpense && (
        <div className="mt-5">
          <AddExpenseButton>Add Your First Expense</AddExpenseButton>
        </div>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
