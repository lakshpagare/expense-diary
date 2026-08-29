import mongoose, { Schema, Model, Document, Types } from "mongoose";
import type { RecurringIncomeFrequency } from "@/types";

export interface IRecurringIncome extends Document {
  userId: Types.ObjectId;
  name: string;
  amount: number;
  category: string;
  source: string;
  frequency: RecurringIncomeFrequency;
  startDate: string; // YYYY-MM-DD
  nextIncomeDate: string; // YYYY-MM-DD
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringIncomeSchema = new Schema<IRecurringIncome>(
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
      required: [true, "Please enter a valid amount."],
      min: 0.01,
    },
    category: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    frequency: {
      type: String,
      enum: ["Weekly", "Monthly", "Yearly"],
      required: true,
    },
    startDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    nextIncomeDate: {
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

RecurringIncomeSchema.index({ userId: 1, nextIncomeDate: 1 });
RecurringIncomeSchema.index({ userId: 1, active: 1 });

const RecurringIncome: Model<IRecurringIncome> =
  mongoose.models.RecurringIncome ||
  mongoose.model<IRecurringIncome>("RecurringIncome", RecurringIncomeSchema);

export default RecurringIncome;
