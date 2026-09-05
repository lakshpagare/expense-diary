"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { budgetSchema, type BudgetInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

export function BudgetForm({
  month,
  year,
  currentAmount,
}: {
  month: number;
  year: number;
  currentAmount: number;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { month, year, amount: currentAmount },
  });

  const onSubmit = async (data: BudgetInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Unable to save budget.");
        return;
      }

      toast.success("Budget updated successfully.");
      router.refresh();
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
        <input type="hidden" {...register("month", { valueAsNumber: true })} />
        <input type="hidden" {...register("year", { valueAsNumber: true })} />
        <div className="flex-1">
          <Label htmlFor="amount">Monthly Budget</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="e.g. 30000"
            {...register("amount", { valueAsNumber: true })}
            error={!!errors.amount}
          />
          <FormError message={errors.amount?.message} />
        </div>
        <Button type="submit" loading={isSubmitting}>
          Save
        </Button>
      </form>
      <FormError message={serverError ?? undefined} />
    </div>
  );
}
