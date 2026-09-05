import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type AuditAction =
  | "TRANSACTION_CREATED"
  | "TRANSACTION_UPDATED"
  | "TRANSACTION_DELETED"
  | "TRANSACTION_RESTORED"
  | "TRANSACTION_PERMANENTLY_DELETED";

export type TransactionType = "expense" | "income";

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: AuditAction;
  transactionType: TransactionType;
  transactionId: Types.ObjectId;
  changedFields?: string[]; // field NAMES only, never values
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "TRANSACTION_CREATED",
        "TRANSACTION_UPDATED",
        "TRANSACTION_DELETED",
        "TRANSACTION_RESTORED",
        "TRANSACTION_PERMANENTLY_DELETED",
      ],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["expense", "income"],
      required: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    changedFields: {
      type: [String],
      default: undefined,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ transactionId: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
