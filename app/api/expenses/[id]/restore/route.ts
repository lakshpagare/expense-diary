import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import { getSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit-log";

export async function POST(
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

    // Explicit isDeleted: true - only restores documents that are actually
    // in Trash, and only for this user.
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: session.userId, isDeleted: true },
      { $set: { isDeleted: false }, $unset: { deletedAt: "", deletedBy: "" } },
      { new: true }
    );

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found in Trash." },
        { status: 404 }
      );
    }

    await recordAuditLog({
      userId: session.userId,
      action: "TRANSACTION_RESTORED",
      transactionType: "expense",
      transactionId: id,
    });

    return NextResponse.json({ expense });
  } catch (err) {
    console.error("Restore expense error:", err);
    return NextResponse.json(
      { error: "Unable to restore expense. Please try again." },
      { status: 500 }
    );
  }
}
