import { z } from "zod";
import { PAYMENT_METHODS, RECURRING_FREQUENCIES } from "@/types";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(5, "Password must be at least 5 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(5, "Password must be at least 5 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const expenseSchema = z.object({
  amount: z.coerce
    .number({ message: "Please enter a valid expense amount." })
    .int("Amount must be a whole number")
    .min(0, "Please enter a valid expense amount."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date."),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please select a valid time.").optional().or(z.literal("")),
  category: z.string().trim().min(1, "Please select a category."),
  place: z.string().trim().max(150).optional().or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: "Please select a payment method.",
  }),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  receipt: z.string().optional().or(z.literal("")),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(50),
  icon: z.string().trim().min(1, "Please choose an icon"),
  color: z.string().trim().optional(),
});

export const budgetSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  amount: z.coerce.number().min(0, "Please enter a valid budget amount."),
});

export const recurringExpenseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  amount: z.coerce.number().positive("Please enter a valid amount."),
  category: z.string().trim().min(1, "Please select a category."),
  frequency: z.enum(RECURRING_FREQUENCIES, {
    message: "Please select a frequency.",
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid start date."),
  active: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  currency: z.string().trim().min(1).max(10),
  monthlyBudget: z.coerce.number().min(0),
  defaultPaymentMethod: z.enum(PAYMENT_METHODS),
  profileImage: z.string().optional().or(z.literal("")),
});
