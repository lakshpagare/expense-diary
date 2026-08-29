import { cn } from "@/lib/utils";

export function MetricTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold text-foreground", valueClassName)}>{value}</p>
    </div>
  );
}
