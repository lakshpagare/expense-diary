import mongoose, { Schema, Model, Document, Types } from "mongoose";
import type { IncomeType } from "@/types";
import { applySoftDelete } from "@/lib/soft-delete-plugin";

export interface IIncome extends Document {
  userId: Types.ObjectId;
  amount: number;
  date: string; // YYYY-MM-DD, matches Expense's date convention for fast range queries
  time: string; // HH:mm
  category: string;
  source: string;
  description?: string;
  incomeType: IncomeType;
  notes?: string;
  attachment?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter a valid income amount."],
      min: [0.01, "Please enter a valid income amount."],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    incomeType: {
      type: String,
      enum: ["one-time", "recurring"],
      required: [true, "Income type is required"],
      default: "one-time",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    attachment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Same indexing strategy as Expense for fast dashboard/report/list queries
IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, category: 1 });
IncomeSchema.index({ userId: 1, incomeType: 1 });
IncomeSchema.index({ userId: 1, source: "text", description: "text", notes: "text" });

applySoftDelete(IncomeSchema);

const Income: Model<IIncome> =
  mongoose.models.Income || mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
