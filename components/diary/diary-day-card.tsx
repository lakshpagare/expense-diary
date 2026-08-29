import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency, formatDate, formatTime12h, getDayPart } from "@/lib/utils";
import type { DiaryDayGroup } from "@/lib/data";
import type { CategoryDTO } from "@/types";

const DAY_PARTS = ["Morning", "Afternoon", "Evening", "Night"] as const;

export function DiaryDayCard({
  group,
  categories,
  currency = "INR",
}: {
  group: DiaryDayGroup;
  categories: CategoryDTO[];
  currency?: string;
}) {
  const catMeta = new Map(categories.map((c) => [c.name, c]));

  const byPart = new Map<string, typeof group.entries>();
  for (const part of DAY_PARTS) byPart.set(part, []);
  for (const entry of group.entries) {
    const part = getDayPart(entry.time);
    byPart.get(part)!.push(entry);
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-foreground">{formatDate(group.date)}</h3>

        <div className="mt-4 space-y-5">
          {DAY_PARTS.map((part) => {
            const entries = byPart.get(part)!;
            if (entries.length === 0) return null;
            return (
              <div key={part}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {part}
                </p>
                <div className="space-y-3 border-l-2 border-border pl-4">
                  {entries.map((e) => {
                    const meta = catMeta.get(e.category);
                    return (
                      <div key={e._id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand" />
                        <div className="flex items-start gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${meta?.color ?? "#94a3b8"}20` }}
                          >
                            <CategoryIcon
                              icon={meta?.icon ?? "more-horizontal"}
                              color={meta?.color}
                              className="h-4 w-4"
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-medium text-foreground">{e.item}</p>
                              <p className="shrink-0 text-sm font-semibold text-foreground">
                                {formatCurrency(e.amount, currency)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatTime12h(e.time)} · {e.place}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-muted-foreground">Total Spent Today</span>
          <span className="text-base font-semibold text-foreground">
            {formatCurrency(group.total, currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
