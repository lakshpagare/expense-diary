import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Income from "@/models/Income";
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
    return NextResponse.json({ error: "Income not found." }, { status: 404 });
  }

  try {
    await connectDB();

    const income = await Income.findOneAndDelete({
      _id: id,
      userId: session.userId,
      isDeleted: true,
    });

    if (!income) {
      return NextResponse.json({ error: "Income not found in Trash." }, { status: 404 });
    }

    await recordAuditLog({
      userId: session.userId,
      action: "TRANSACTION_PERMANENTLY_DELETED",
      transactionType: "income",
      transactionId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Permanently delete income error:", err);
    return NextResponse.json(
      { error: "Unable to permanently delete income. Please try again." },
      { status: 500 }
    );
  }
}
