import mongoose, { Schema, Model, Document, Types } from "mongoose";
import type { RecurringFrequency } from "@/types";

export interface IRecurringExpense extends Document {
  userId: Types.ObjectId;
  name: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringExpenseSchema = new Schema<IRecurringExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: [true, "Please enter a valid expense amount."],
      min: 0.01,
    },
    category: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Yearly"],
      required: true,
    },
    startDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    nextDueDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

RecurringExpenseSchema.index({ userId: 1, nextDueDate: 1 });
RecurringExpenseSchema.index({ userId: 1, active: 1 });

const RecurringExpense: Model<IRecurringExpense> =
  mongoose.models.RecurringExpense ||
  mongoose.model<IRecurringExpense>("RecurringExpense", RecurringExpenseSchema);

export default RecurringExpense;
