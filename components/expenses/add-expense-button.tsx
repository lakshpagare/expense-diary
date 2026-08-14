"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenseModal } from "@/components/expenses/expense-modal-context";
import type { ButtonProps } from "@/components/ui/button";

export function AddExpenseButton({
  children = "Add Expense",
  ...props
}: Partial<ButtonProps>) {
  const { openAddModal } = useExpenseModal();
  return (
    <Button onClick={openAddModal} {...props}>
      <Plus className="h-4 w-4" />
      {children}
    </Button>
  );
}
