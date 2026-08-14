import mongoose, { Schema, Model, Document, Types } from "mongoose";
import type { PaymentMethod } from "@/types";

export interface IExpense extends Document {
  userId: Types.ObjectId;
  amount: number;
  date: string; // stored as YYYY-MM-DD for fast range queries + grouping
  time?: string; // HH:mm - optional
  category: string;
  place?: string; // optional
  paymentMethod: PaymentMethod;
  notes?: string;
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter a valid expense amount."],
      min: [0.01, "Please enter a valid expense amount."],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    time: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    place: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Wallet", "Other"],
      required: [true, "Payment method is required"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    receipt: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound indexes to keep dashboard/report/list queries fast at scale
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });
ExpenseSchema.index({ userId: 1, paymentMethod: 1 });
ExpenseSchema.index({ userId: 1, place: 1 });
ExpenseSchema.index({ userId: 1, place: "text" });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
