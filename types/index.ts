export type PaymentMethod =
  | "UPI"
  | "Cash"
  | "Credit Card"
  | "Debit Card"
  | "Bank Transfer"
  | "Wallet"
  | "Other";

export const PAYMENT_METHODS = [
  "UPI",
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Wallet",
  "Other",
] as const;

export type RecurringFrequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

export const RECURRING_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Yearly"] as const;

// Default categories seeded for every new user, with an icon key
// mapped to a lucide-react icon in components/ui/category-icon.tsx
export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Food", icon: "utensils", color: "#f59e0b" },
  { name: "Travel", icon: "car", color: "#3b82f6" },
  { name: "Shopping", icon: "shopping-bag", color: "#ec4899" },
  { name: "Bills", icon: "receipt", color: "#ef4444" },
  { name: "Rent", icon: "home", color: "#8b5cf6" },
  { name: "Entertainment", icon: "clapperboard", color: "#06b6d4" },
  { name: "Health", icon: "heart-pulse", color: "#f43f5e" },
  { name: "Education", icon: "graduation-cap", color: "#6366f1" },
  { name: "Groceries", icon: "shopping-cart", color: "#22c55e" },
  { name: "Fuel", icon: "fuel", color: "#f97316" },
  { name: "Recharge", icon: "smartphone", color: "#14b8a6" },
  { name: "Subscriptions", icon: "repeat", color: "#a855f7" },
  { name: "Personal", icon: "user", color: "#64748b" },
  { name: "Other", icon: "more-horizontal", color: "#94a3b8" },
];

export interface ExpenseDTO {
  _id: string;
  userId: string;
  amount: number;
  date: string; // ISO date (YYYY-MM-DD)
  time?: string; // HH:mm - optional
  category: string;
  place?: string; // optional
  paymentMethod: PaymentMethod;
  notes?: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  currency: string;
  monthlyBudget: number;
  defaultPaymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color?: string;
  createdAt: string;
}

export interface BudgetDTO {
  _id: string;
  userId: string;
  month: number; // 1-12
  year: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpenseDTO {
  _id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextDueDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
