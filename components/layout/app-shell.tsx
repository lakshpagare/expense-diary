"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";
import { NAV_ITEMS } from "./nav-items";
import { ExpenseModalProvider } from "@/components/expenses/expense-modal-context";
import { AddExpenseModal } from "@/components/expenses/add-expense-modal";

function pageTitleFor(pathname: string): string {
  const match = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  return match?.label ?? "Expense Diary";
}

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: ReactNode;
  userName: string;
  userEmail: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ExpenseModalProvider>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
          <div className="sticky top-0 h-screen">
            <SidebarNav userName={userName} userEmail={userEmail} />
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 modal-fade-in"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="modal-slide-in absolute left-0 top-0 h-full w-72 bg-card shadow-xl">
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarNav
                userName={userName}
                userEmail={userEmail}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
          <Header title={pageTitleFor(pathname)} onMenuClick={() => setDrawerOpen(true)} />
          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>

      <AddExpenseModal />
    </ExpenseModalProvider>
  );
}
