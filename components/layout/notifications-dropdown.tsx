"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, AlertTriangle, TrendingUp, Repeat, Wallet, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type:
    | "budget_warning"
    | "budget_exceeded"
    | "recurring_due"
    | "large_expense"
    | "category_limit_warning"
    | "category_limit_exceeded";
  title: string;
  message: string;
  date: string;
}

const ICONS: Record<Notification["type"], typeof Bell> = {
  budget_warning: AlertTriangle,
  budget_exceeded: Wallet,
  recurring_due: Repeat,
  large_expense: TrendingUp,
  category_limit_warning: PieChart,
  category_limit_exceeded: PieChart,
};

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {notifications.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="dropdown-in absolute right-0 top-12 z-20 max-h-96 w-80 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          </div>
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up. No notifications right now.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = ICONS[n.type];
                const isWarning =
                  n.type === "budget_exceeded" ||
                  n.type === "budget_warning" ||
                  n.type === "category_limit_exceeded" ||
                  n.type === "category_limit_warning";
                return (
                  <div key={n.id} className="flex gap-3 px-4 py-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isWarning ? "bg-destructive/10 text-destructive" : "bg-brand-light text-brand"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
