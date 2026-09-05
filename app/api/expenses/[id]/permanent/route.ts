import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import { getSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit-log";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  try {
    await connectDB();

    // Both userId AND isDeleted: true are required in the filter - a
    // transaction can only ever be permanently removed from Trash, never
    // directly, and never another user's data.
    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: session.userId,
      isDeleted: true,
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found in Trash." },
        { status: 404 }
      );
    }

    await recordAuditLog({
      userId: session.userId,
      action: "TRANSACTION_PERMANENTLY_DELETED",
      transactionType: "expense",
      transactionId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Permanently delete expense error:", err);
    return NextResponse.json(
      { error: "Unable to permanently delete expense. Please try again." },
      { status: 500 }
    );
  }
}
