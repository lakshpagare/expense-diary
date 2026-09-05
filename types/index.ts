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
  time: string; // HH:mm
  category: string;
  place: string;
  item: string;
  description?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  receipt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
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
  monthlyLimit?: number;
  isDefault?: boolean;
  monthlySpend?: number;
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

/* ------------------------------------------------------------------ */
/* Income module                                                       */
/* ------------------------------------------------------------------ */

export type IncomeType = "one-time" | "recurring";

export const INCOME_TYPES = ["one-time", "recurring"] as const;

export interface IncomeCategoryMeta {
  name: string;
  icon: string;
  color: string;
}

// Fixed list (not user-customizable) per spec, mirroring the shape of
// DEFAULT_CATEGORIES but kept separate since income categories are not
// user-manageable the way expense categories are.
export const INCOME_CATEGORIES: IncomeCategoryMeta[] = [
  { name: "Salary", icon: "wallet", color: "#059669" },
  { name: "Freelancing", icon: "laptop", color: "#0ea5e9" },
  { name: "Business", icon: "briefcase", color: "#6366f1" },
  { name: "Rental Income", icon: "home", color: "#8b5cf6" },
  { name: "Investment Returns", icon: "trending-up", color: "#14b8a6" },
  { name: "Interest", icon: "percent", color: "#22c55e" },
  { name: "Gift", icon: "gift", color: "#ec4899" },
  { name: "Cashback", icon: "badge-percent", color: "#f59e0b" },
  { name: "Refund", icon: "rotate-ccw", color: "#f97316" },
  { name: "Selling", icon: "shopping-bag", color: "#a855f7" },
  { name: "Part-time", icon: "clock", color: "#06b6d4" },
  { name: "Teaching", icon: "graduation-cap", color: "#3b82f6" },
  { name: "Other", icon: "more-horizontal", color: "#94a3b8" },
];

export const INCOME_CATEGORY_NAMES = INCOME_CATEGORIES.map((c) => c.name);

export interface IncomeDTO {
  _id: string;
  userId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: string;
  source: string;
  description?: string;
  incomeType: IncomeType;
  notes?: string;
  attachment?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type TrashItemDTO =
  | (ExpenseDTO & { transactionType: "expense" })
  | (IncomeDTO & { transactionType: "income" });

export const RECURRING_INCOME_FREQUENCIES = ["Weekly", "Monthly", "Yearly"] as const;
export type RecurringIncomeFrequency = (typeof RECURRING_INCOME_FREQUENCIES)[number];

export interface RecurringIncomeDTO {
  _id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  source: string;
  frequency: RecurringIncomeFrequency;
  startDate: string;
  nextIncomeDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalDTO {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  targetDate?: string;
  currentAmount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
