"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, WalletCards, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn, formatCurrency, formatTime12h, todayISO } from "@/lib/utils";
import { INCOME_CATEGORIES } from "@/types";
import type { IncomeDTO, ExpenseDTO } from "@/types";

interface DayTotal {
  date: string;
  income: number;
  expenses: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const incomeCategoryMeta = new Map(INCOME_CATEGORIES.map((c) => [c.name, c]));

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CalendarView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [monthData, setMonthData] = useState<{ key: string; days: DayTotal[] } | null>(null);
  const monthKey = `${year}-${month}`;
  const loading = !monthData || monthData.key !== monthKey;
  const days = monthData?.key === monthKey ? monthData.days : [];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetails, setDayDetails] = useState<{ income: IncomeDTO[]; expenses: ExpenseDTO[] } | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMonthData({ key: monthKey, days: data.days ?? [] });
      })
      .catch(() => {
        if (!cancelled) setMonthData({ key: monthKey, days: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [year, month, monthKey]);

  const dayMap = new Map(days.map((d) => [d.date, d]));

  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goPrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  const openDay = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setDetailsLoading(true);
    fetch(`/api/calendar/day?date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => setDayDetails(data))
      .catch(() => setDayDetails({ income: [], expenses: [] }))
      .finally(() => setDetailsLoading(false));
  }, []);

  const monthLabel = firstOfMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const today = todayISO();

  const dayIncomeTotal = dayDetails?.income.reduce((s, i) => s + i.amount, 0) ?? 0;
  const dayExpenseTotal = dayDetails?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{monthLabel}</h2>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <button
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton h-[420px] rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="aspect-square border-b border-r border-border" />;
              const dateStr = `${year}-${pad(month)}-${pad(day)}`;
              const totals = dayMap.get(dateStr);
              const isToday = dateStr === today;
              return (
                <button
                  key={dateStr}
                  onClick={() => openDay(dateStr)}
                  className={cn(
                    "flex aspect-square flex-col items-start gap-0.5 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-muted/50 sm:p-2",
                    isToday && "bg-brand-light/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium sm:h-6 sm:w-6",
                      isToday ? "bg-brand text-brand-foreground" : "text-foreground"
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-auto w-full space-y-0.5">
                    {totals?.income ? (
                      <p className="truncate text-[9px] font-medium text-brand sm:text-[10px]">
                        +{formatCurrency(totals.income)}
                      </p>
                    ) : null}
                    {totals?.expenses ? (
                      <p className="truncate text-[9px] font-medium text-destructive sm:text-[10px]">
                        -{formatCurrency(totals.expenses)}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
        size="md"
      >
        <div className="p-5">
          {detailsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Daily summary */}
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="text-sm font-semibold text-brand">{formatCurrency(dayIncomeTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="text-sm font-semibold text-destructive">{formatCurrency(dayExpenseTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(dayIncomeTotal - dayExpenseTotal)}
                  </p>
                </div>
              </div>

              {/* Income section */}
              {dayDetails && dayDetails.income.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <WalletCards className="h-3.5 w-3.5" /> Income
                  </p>
                  <div className="space-y-2">
                    {dayDetails.income.map((inc) => {
                      const meta = incomeCategoryMeta.get(inc.category);
                      return (
                        <div key={inc._id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${meta?.color ?? "#94a3b8"}20` }}
                          >
                            <CategoryIcon icon={meta?.icon ?? "more-horizontal"} color={meta?.color} className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{inc.source}</p>
                            <p className="text-xs text-muted-foreground">{inc.category} · {formatTime12h(inc.time)}</p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-brand">+{formatCurrency(inc.amount)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expenses section */}
              {dayDetails && dayDetails.expenses.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" /> Expenses
                  </p>
                  <div className="space-y-2">
                    {dayDetails.expenses.map((e) => (
                      <div key={e._id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{e.item}</p>
                          <p className="text-xs text-muted-foreground">{e.category} · {formatTime12h(e.time)}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-destructive">-{formatCurrency(e.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dayDetails && dayDetails.income.length === 0 && dayDetails.expenses.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No income or expenses recorded on this day.
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
