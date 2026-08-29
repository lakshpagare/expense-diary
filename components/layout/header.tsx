"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsDropdown } from "./notifications-dropdown";
import { useExpenseModal } from "@/components/expenses/expense-modal-context";
import { useIncomeModal } from "@/components/income/income-modal-context";

export function Header({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { openAddModal } = useExpenseModal();
  const { openAddModal: openAddIncomeModal } = useIncomeModal();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/expenses?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden shrink-0 text-lg font-semibold text-foreground sm:block">
        {title}
      </h1>

      <form onSubmit={handleSearch} className="ml-auto flex-1 sm:ml-4 sm:max-w-xs">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="h-10 w-full rounded-xl border border-border bg-muted/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-1.5">
        <NotificationsDropdown />
        <ThemeToggle />
        <Button
          onClick={openAddIncomeModal}
          variant="secondary"
          size="sm"
          className="ml-1 hidden sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
        <Button onClick={openAddModal} size="sm" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
        <Button onClick={openAddIncomeModal} variant="secondary" size="icon" className="sm:hidden">
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={openAddModal} size="icon" className="sm:hidden">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
