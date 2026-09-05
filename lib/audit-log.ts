import AuditLog, { type AuditAction, type TransactionType } from "@/models/AuditLog";
import { connectDB } from "@/lib/db";

export async function recordAuditLog(params: {
  userId: string;
  action: AuditAction;
  transactionType: TransactionType;
  transactionId: string;
  changedFields?: string[];
}) {
  try {
    await connectDB();
    await AuditLog.create({
      userId: params.userId,
      action: params.action,
      transactionType: params.transactionType,
      transactionId: params.transactionId,
      changedFields: params.changedFields,
    });
  } catch (err) {
    // Auditing must never break the actual user-facing operation.
    console.error("Audit log write failed:", err);
  }
}

/**
 * Compares two plain objects and returns only the field NAMES that differ -
 * never the actual values, so audit logs never contain financial figures.
 */
export function diffFieldNames(
  before: Record<string, unknown>,
  after: Record<string, unknown> | object
): string[] {
  const beforeObj = before;
  const afterObj = after as Record<string, unknown>;
  const fields = new Set<string>([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
  const changed: string[] = [];
  for (const field of fields) {
    if (JSON.stringify(beforeObj[field]) !== JSON.stringify(afterObj[field])) {
      changed.push(field);
    }
  }
  return changed;
}
