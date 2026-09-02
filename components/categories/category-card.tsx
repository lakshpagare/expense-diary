"use client";

import { Pencil, Trash2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency } from "@/lib/utils";
import type { CategoryDTO } from "@/types";

function progressColor(pct: number): string {
  if (pct >= 90) return "#dc2626"; // red
  if (pct >= 60) return "#d97706"; // amber
  return "#059669"; // green
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const spend = category.monthlySpend ?? 0;
  const limit = category.monthlyLimit;
  const hasLimit = !!limit && limit > 0;
  const pct = hasLimit ? Math.round((spend / limit) * 100) : 0;
  const barPct = Math.min(100, pct);
  const exceeded = hasLimit && pct >= 100;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${category.color ?? "#94a3b8"}20` }}
            >
              <CategoryIcon icon={category.icon} color={category.color} className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium text-foreground">{category.name}</p>
              {category.isDefault && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Inbuilt
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              title={category.isDefault ? "Edit monthly limit" : "Edit category"}
            >
              <Pencil className="h-4 w-4" />
            </button>
            {!category.isDefault && (
              <button
                onClick={onDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {hasLimit ? (
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                {formatCurrency(spend)} of {formatCurrency(limit)}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: progressColor(pct) }}
              >
                {pct}%
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${barPct}%`, backgroundColor: progressColor(pct) }}
              />
            </div>
            {exceeded && (
              <p className="mt-2 text-xs font-medium text-destructive">
                Limit exceeded — new expenses are still saved normally.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No monthly limit set — spent {formatCurrency(spend)} this month.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
