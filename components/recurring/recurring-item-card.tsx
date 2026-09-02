"use client";

import { Pencil, Trash2, CheckCircle2, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export function RecurringItemCard({
  name,
  subtitle,
  amount,
  frequency,
  nextDate,
  active,
  positive = false,
  onEdit,
  onDelete,
  onToggleActive,
  onLogNow,
  logging,
}: {
  name: string;
  subtitle?: string;
  amount: number;
  frequency: string;
  nextDate: string;
  active: boolean;
  positive?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onLogNow: () => void;
  logging?: boolean;
}) {
  return (
    <Card className={cn(!active && "opacity-60")}>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{name}</p>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <p className={cn("shrink-0 text-lg font-semibold", positive ? "text-brand" : "text-foreground")}>
            {positive ? "+" : ""}
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{frequency}</span>
          <span>
            Next: <span className="font-medium text-foreground">{formatDate(nextDate)}</span>
          </span>
          {!active && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
              Inactive
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Button size="sm" variant="outline" onClick={onLogNow} loading={logging}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Log now
          </Button>
          <Button size="sm" variant="ghost" onClick={onToggleActive}>
            <Power className="h-3.5 w-3.5" />
            {active ? "Deactivate" : "Activate"}
          </Button>
          <div className="ml-auto flex gap-1">
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
