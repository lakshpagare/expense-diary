"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { recurringExpenseSchema, type RecurringExpenseInput } from "@/lib/validations";
import { RECURRING_FREQUENCIES } from "@/types";
import type { RecurringExpenseDTO, CategoryDTO } from "@/types";
import { todayISO } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

interface RecurringExpenseFormProps {
  item?: RecurringExpenseDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RecurringExpenseForm({ item, onSuccess, onCancel }: RecurringExpenseFormProps) {
  const isEditing = !!item;
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecurringExpenseInput>({
    resolver: zodResolver(recurringExpenseSchema),
    defaultValues: item
      ? {
          name: item.name,
          amount: item.amount,
          category: item.category,
          frequency: item.frequency,
          startDate: item.startDate,
          active: item.active,
        }
      : {
          name: "",
          amount: undefined,
          category: "",
          frequency: "Monthly",
          startDate: todayISO(),
          active: true,
        },
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => toast.error("Unable to load categories."));
  }, []);

  const onSubmit = async (data: RecurringExpenseInput) => {
    setServerError(null);
    try {
      const url = isEditing ? `/api/recurring-expenses/${item!._id}` : "/api/recurring-expenses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Unable to save recurring expense.");
        return;
      }

      toast.success(isEditing ? "Recurring expense updated." : "Recurring expense added.");
      onSuccess();
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="space-y-4 p-5">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="e.g. Rent" {...register("name")} error={!!errors.name} />
          <FormError message={errors.name?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              error={!!errors.amount}
            />
            <FormError message={errors.amount?.message} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" {...register("category")} error={!!errors.category}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
            <FormError message={errors.category?.message} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select id="frequency" {...register("frequency")} error={!!errors.frequency}>
              {RECURRING_FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
            <FormError message={errors.frequency?.message} />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" {...register("startDate")} error={!!errors.startDate} />
            <FormError message={errors.startDate?.message} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("active")} />
          Active
        </label>

        <FormError message={serverError ?? undefined} />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-5 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Save Changes" : "Add Recurring Expense"}
        </Button>
      </div>
    </form>
  );
}
