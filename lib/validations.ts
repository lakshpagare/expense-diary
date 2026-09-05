import { z } from "zod";
import {
  PAYMENT_METHODS,
  RECURRING_FREQUENCIES,
  INCOME_TYPES,
  INCOME_CATEGORY_NAMES,
  RECURRING_INCOME_FREQUENCIES,
} from "@/types";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Please enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Please enter your email or phone number"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Please enter the 6-digit code"),
});

export type OtpInput = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const expenseSchema = z.object({
  amount: z
    .number({ message: "Please enter a valid expense amount." })
    .positive("Please enter a valid expense amount."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date."),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please select a valid time."),
  category: z.string().trim().min(1, "Please select a category."),
  place: z.string().trim().min(1, "Please enter a place.").max(150),
  item: z.string().trim().min(1, "Please enter what was purchased.").max(150),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: "Please select a payment method.",
  }),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  receipt: z.string().optional().or(z.literal("")),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const incomeSchema = z.object({
  amount: z
    .number({ message: "Please enter a valid income amount." })
    .positive("Please enter a valid income amount."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date."),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please select a valid time."),
  category: z.enum(INCOME_CATEGORY_NAMES as [string, ...string[]], {
    message: "Please select a category.",
  }),
  source: z.string().trim().min(1, "Please enter an income source.").max(150),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  incomeType: z.enum(INCOME_TYPES, {
    message: "Please select an income type.",
  }),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  attachment: z.string().optional().or(z.literal("")),
});

export type IncomeInput = z.infer<typeof incomeSchema>;

export const recurringIncomeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  amount: z.number().positive("Please enter a valid amount."),
  category: z.enum(INCOME_CATEGORY_NAMES as [string, ...string[]], {
    message: "Please select a category.",
  }),
  source: z.string().trim().min(1, "Please enter a source.").max(150),
  frequency: z.enum(RECURRING_INCOME_FREQUENCIES, {
    message: "Please select a frequency.",
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid start date."),
  active: z.boolean().optional(),
});

export const savingsGoalSchema = z.object({
  name: z.string().trim().min(1, "Goal name is required").max(100),
  targetAmount: z.coerce.number().positive("Please enter a valid target amount."),
  targetDate: z.string().optional().or(z.literal("")),
  currentAmount: z.coerce.number().min(0).optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(50),
  icon: z.string().trim().min(1, "Please choose an icon"),
  color: z.string().trim().optional(),
  monthlyLimit: z
    .number()
    .min(0, "Please enter a valid limit amount.")
    .optional()
    .nullable(),
});

// Editing an existing category only ever needs a subset of these fields
// (default categories can only change monthlyLimit) - the API decides
// which fields are actually applied based on whether it's a default category.
export const categoryLimitSchema = z.object({
  monthlyLimit: z.number().min(0, "Please enter a valid limit amount.").optional().nullable(),
});

export const budgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  amount: z.number().min(0, "Please enter a valid budget amount."),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

export const recurringExpenseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  amount: z.number().positive("Please enter a valid amount."),
  category: z.string().trim().min(1, "Please select a category."),
  frequency: z.enum(RECURRING_FREQUENCIES, {
    message: "Please select a frequency.",
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid start date."),
  active: z.boolean().optional(),
});

export type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;
export type RecurringIncomeInput = z.infer<typeof recurringIncomeSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  currency: z.string().trim().min(1).max(10),
  monthlyBudget: z.number().min(0, "Please enter a valid budget amount."),
  defaultPaymentMethod: z.enum(PAYMENT_METHODS),
  profileImage: z.string().optional().or(z.literal("")),
});
