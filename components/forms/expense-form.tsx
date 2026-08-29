"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { expenseSchema, type ExpenseInput } from "@/lib/validations";
import { PAYMENT_METHODS } from "@/types";
import type { ExpenseDTO, CategoryDTO } from "@/types";
import { todayISO, nowHHMM } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";

const LAST_PAYMENT_METHOD_KEY = "expense-diary:last-payment-method";

interface ExpenseFormProps {
  expense?: ExpenseDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const isEditing = !!expense;
  const amountRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const lastPaymentMethod =
    typeof window !== "undefined"
      ? localStorage.getItem(LAST_PAYMENT_METHOD_KEY)
      : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          amount: expense.amount,
          date: expense.date,
          time: expense.time,
          category: expense.category,
          place: expense.place,
          item: expense.item,
          description: expense.description ?? "",
          paymentMethod: expense.paymentMethod,
          notes: expense.notes ?? "",
        }
      : {
          amount: undefined,
          date: todayISO(),
          time: nowHHMM(),
          category: "",
          place: "",
          item: "",
          description: "",
          paymentMethod: (lastPaymentMethod as ExpenseInput["paymentMethod"]) || "UPI",
          notes: "",
        },
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    // Autofocus amount for fast entry, as specified
    amountRef.current?.focus();
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        if (!isEditing && !selectedCategory && data.categories?.[0]) {
          setValue("category", data.categories[0].name);
        }
      })
      .catch(() => toast.error("Unable to load categories."))
      .finally(() => setLoadingCategories(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: ExpenseInput) => {
    setServerError(null);
    try {
      const url = isEditing ? `/api/expenses/${expense!._id}` : "/api/expenses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Unable to save expense.");
        return;
      }

      localStorage.setItem(LAST_PAYMENT_METHOD_KEY, data.paymentMethod);
      toast.success(isEditing ? "Expense updated successfully." : "Expense added successfully.");
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
            <Label htmlFor="paymentMethod">Payment method</Label>
            <Select id="paymentMethod" {...register("paymentMethod")} error={!!errors.paymentMethod}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <FormError message={errors.paymentMethod?.message} />
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
          <Label>Category</Label>
          {loadingCategories ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-16 w-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c._id}
                  onClick={() => setValue("category", c.name, { shouldValidate: true })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition-colors",
                    selectedCategory === c.name
                      ? "border-brand bg-brand-light text-brand"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <CategoryIcon icon={c.icon} color={selectedCategory === c.name ? undefined : c.color} className="h-5 w-5" />
                  <span className="w-full truncate text-[11px] font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          <FormError message={errors.category?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="place">Place</Label>
            <Input id="place" placeholder="Amazon" {...register("place")} error={!!errors.place} />
            <FormError message={errors.place?.message} />
          </div>
          <div>
            <Label htmlFor="item">Item</Label>
            <Input id="item" placeholder="Headphones" {...register("item")} error={!!errors.item} />
            <FormError message={errors.item?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Short description..."
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
          {isEditing ? "Save Changes" : "Save Expense"}
        </Button>
      </div>
    </form>
  );
}
