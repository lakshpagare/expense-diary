import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number; // in rupees
  status: "created" | "paid" | "failed";
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    periodStart: {
      type: String,
      required: true,
    },
    periodEnd: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
