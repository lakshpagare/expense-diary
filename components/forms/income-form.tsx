"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { incomeSchema, type IncomeInput } from "@/lib/validations";
import { INCOME_CATEGORIES, INCOME_TYPES, type IncomeDTO } from "@/types";
import { todayISO, nowHHMM, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { CategoryIcon } from "@/components/ui/category-icon";

interface IncomeFormProps {
  income?: IncomeDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IncomeForm({ income, onSuccess, onCancel }: IncomeFormProps) {
  const isEditing = !!income;
  const amountRef = useRef<HTMLInputElement | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: income
      ? {
          amount: income.amount,
          date: income.date,
          time: income.time,
          category: income.category,
          source: income.source,
          description: income.description ?? "",
          incomeType: income.incomeType,
          notes: income.notes ?? "",
        }
      : {
          amount: undefined,
          date: todayISO(),
          time: nowHHMM(),
          category: INCOME_CATEGORIES[0].name,
          source: "",
          description: "",
          incomeType: "one-time",
          notes: "",
        },
  });

  const selectedCategory = watch("category");
  const selectedType = watch("incomeType");

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const onSubmit = async (data: IncomeInput) => {
    setServerError(null);
    try {
      const url = isEditing ? `/api/income/${income!._id}` : "/api/income";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Unable to save income.");
        return;
      }

      toast.success(isEditing ? "Income updated successfully." : "Income added successfully.");
      onSuccess();
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              ref={(el) => {
                register("amount", { valueAsNumber: true }).ref(el);
                amountRef.current = el;
              }}
              error={!!errors.amount}
            />
            <FormError message={errors.amount?.message} />
          </div>
          <div>
            <Label>Income Type</Label>
            <div className="flex h-11 items-center gap-1 rounded-xl bg-muted p-1">
              {INCOME_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setValue("incomeType", t, { shouldValidate: true })}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors",
                    selectedType === t
                      ? "bg-card text-brand shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "one-time" ? "One-time" : "Recurring"}
                </button>
              ))}
            </div>
            <FormError message={errors.incomeType?.message} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} error={!!errors.date} />
            <FormError message={errors.date?.message} />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" {...register("time")} error={!!errors.time} />
            <FormError message={errors.time?.message} />
          </div>
        </div>

        <div>
          <Label>Income Category</Label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {INCOME_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.name}
                onClick={() => setValue("category", c.name, { shouldValidate: true })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition-colors",
                  selectedCategory === c.name
                    ? "border-brand bg-brand-light text-brand"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <CategoryIcon
                  icon={c.icon}
                  color={selectedCategory === c.name ? undefined : c.color}
                  className="h-5 w-5"
                />
                <span className="w-full truncate text-[10.5px] font-medium">{c.name}</span>
              </button>
            ))}
          </div>
          <FormError message={errors.category?.message} />
        </div>

        <div>
          <Label htmlFor="source">Income Source</Label>
          <Input
            id="source"
            placeholder="ABC Technologies"
            {...register("source")}
            error={!!errors.source}
          />
          <FormError message={errors.source?.message} />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="August monthly salary"
            rows={2}
            {...register("description")}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" placeholder="Any additional notes..." rows={2} {...register("notes")} />
        </div>

        <FormError message={serverError ?? undefined} />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-5 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Save Changes" : "Save Income"}
        </Button>
      </div>
    </form>
  );
}
