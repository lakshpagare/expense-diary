import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IBudget extends Document {
  userId: Types.ObjectId;
  month: number; // 1-12
  year: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: 0,
    },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);

export default Budget;
