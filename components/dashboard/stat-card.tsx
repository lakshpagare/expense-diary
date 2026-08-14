import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

export function StatCard({
  label,
  amount,
  currency = "INR",
  icon: Icon,
  changePercent,
  changeLabel = "from last month",
  iconColor = "text-brand",
  iconBg = "bg-brand-light",
}: {
  label: string;
  amount: number;
  currency?: string;
  icon: LucideIcon;
  changePercent?: number | null;
  changeLabel?: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-semibold text-foreground">
            {formatCurrency(amount, currency)}
          </p>
          {changePercent !== undefined && changePercent !== null && (
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1 text-xs font-medium",
                changePercent >= 0 ? "text-destructive" : "text-brand"
              )}
            >
              {changePercent >= 0 ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(changePercent)}% {changeLabel}
            </p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardContent>
    </Card>
  );
}
