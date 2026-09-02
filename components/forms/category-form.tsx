"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { categorySchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { CategoryIcon, AVAILABLE_ICONS } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/types";

type CategoryFormInput = z.infer<typeof categorySchema>;

const COLOR_SWATCHES = [
  "#059669",
  "#3b82f6",
  "#ec4899",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f43f5e",
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#14b8a6",
  "#a855f7",
  "#64748b",
  "#94a3b8",
];

interface CategoryFormProps {
  category?: CategoryDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEditing = !!category;
  const isDefault = !!category?.isDefault;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      icon: category?.icon ?? AVAILABLE_ICONS[0],
      color: category?.color ?? COLOR_SWATCHES[0],
      monthlyLimit: category?.monthlyLimit ?? undefined,
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  const onSubmit = async (data: CategoryFormInput) => {
    setServerError(null);
    try {
      const url = isEditing ? `/api/categories/${category!._id}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      // Default categories only ever send monthlyLimit - the API enforces
      // this too, but keeping the payload minimal avoids any confusion.
      const payload = isDefault ? { monthlyLimit: data.monthlyLimit ?? null } : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Unable to save category.");
        return;
      }

      toast.success(isEditing ? "Category updated successfully." : "Category created successfully.");
      onSuccess();
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="space-y-4 p-5">
        {!isDefault && (
          <>
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" placeholder="e.g. Pets" {...register("name")} error={!!errors.name} />
              <FormError message={errors.name?.message} />
            </div>

            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    type="button"
                    key={icon}
                    onClick={() => setValue("icon", icon, { shouldValidate: true })}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                      selectedIcon === icon
                        ? "border-brand bg-brand-light text-brand"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <CategoryIcon icon={icon} className="h-4.5 w-4.5" />
                  </button>
                ))}
              </div>
              <FormError message={errors.icon?.message} />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setValue("color", color)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform",
                      selectedColor === color ? "scale-110 border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {isDefault && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${category?.color ?? "#94a3b8"}20` }}
            >
              <CategoryIcon icon={category?.icon ?? "more-horizontal"} color={category?.color} className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{category?.name}</p>
              <p className="text-xs text-muted-foreground">
                Inbuilt category — only the monthly limit can be changed.
              </p>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="monthlyLimit">Monthly Limit (optional)</Label>
          <Input
            id="monthlyLimit"
            type="number"
            step="0.01"
            placeholder="e.g. 5000"
            {...register("monthlyLimit", {
              setValueAs: (v) => (v === "" || v === undefined ? undefined : Number(v)),
            })}
            error={!!errors.monthlyLimit}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Leave blank for no limit. Adding expenses is never blocked — you&apos;ll just see a
            warning once you cross it.
          </p>
          <FormError message={errors.monthlyLimit?.message} />
        </div>

        <FormError message={serverError ?? undefined} />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-5 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Save Changes" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
