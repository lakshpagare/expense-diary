"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { recurringIncomeSchema, type RecurringIncomeInput } from "@/lib/validations";
import { RECURRING_INCOME_FREQUENCIES, INCOME_CATEGORIES } from "@/types";
import type { RecurringIncomeDTO } from "@/types";
import { todayISO } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

interface RecurringIncomeFormProps {
  item?: RecurringIncomeDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RecurringIncomeForm({ item, onSuccess, onCancel }: RecurringIncomeFormProps) {
  const isEditing = !!item;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecurringIncomeInput>({
    resolver: zodResolver(recurringIncomeSchema),
    defaultValues: item
      ? {
          name: item.name,
          amount: item.amount,
          category: item.category,
          source: item.source,
          frequency: item.frequency,
          startDate: item.startDate,
          active: item.active,
        }
      : {
          name: "",
          amount: undefined,
          category: INCOME_CATEGORIES[0].name,
          source: "",
          frequency: "Monthly",
          startDate: todayISO(),
          active: true,
        },
  });

  const onSubmit = async (data: RecurringIncomeInput) => {
    setServerError(null);
    try {
      const url = isEditing ? `/api/recurring-income/${item!._id}` : "/api/recurring-income";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Unable to save recurring income.");
        return;
      }

      toast.success(isEditing ? "Recurring income updated." : "Recurring income added.");
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
          <Input id="name" placeholder="e.g. Salary" {...register("name")} error={!!errors.name} />
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
              {INCOME_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
            <FormError message={errors.category?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="e.g. ABC Technologies"
            {...register("source")}
            error={!!errors.source}
          />
          <FormError message={errors.source?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select id="frequency" {...register("frequency")} error={!!errors.frequency}>
              {RECURRING_INCOME_FREQUENCIES.map((f) => (
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
          {isEditing ? "Save Changes" : "Add Recurring Income"}
        </Button>
      </div>
    </form>
  );
}
