import {
  LayoutDashboard,
  BookOpenText,
  Receipt,
  CalendarDays,
  BarChart3,
  Wallet,
  Repeat,
  Tags,
  Settings,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expense Diary", href: "/diary", icon: BookOpenText },
  { label: "Income", href: "/income", icon: WalletCards },
  { label: "All Expenses", href: "/expenses", icon: Receipt },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Budgets", href: "/budgets", icon: Wallet },
  { label: "Recurring Expenses", href: "/recurring-expenses", icon: Repeat },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Settings", href: "/settings", icon: Settings },
];
