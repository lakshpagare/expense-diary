"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIncomeModal } from "@/components/income/income-modal-context";
import type { ButtonProps } from "@/components/ui/button";

export function AddIncomeButton({
  children = "Add Income",
  ...props
}: Partial<ButtonProps>) {
  const { openAddModal } = useIncomeModal();
  return (
    <Button onClick={openAddModal} variant="secondary" {...props}>
      <Plus className="h-4 w-4" />
      {children}
    </Button>
  );
}
