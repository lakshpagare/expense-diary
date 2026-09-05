import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Income from "@/models/Income";
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
    return NextResponse.json({ error: "Income not found." }, { status: 404 });
  }

  try {
    await connectDB();

    const income = await Income.findOneAndUpdate(
      { _id: id, userId: session.userId, isDeleted: true },
      { $set: { isDeleted: false }, $unset: { deletedAt: "", deletedBy: "" } },
      { new: true }
    );

    if (!income) {
      return NextResponse.json({ error: "Income not found in Trash." }, { status: 404 });
    }

    await recordAuditLog({
      userId: session.userId,
      action: "TRANSACTION_RESTORED",
      transactionType: "income",
      transactionId: id,
    });

    return NextResponse.json({ income });
  } catch (err) {
    console.error("Restore income error:", err);
    return NextResponse.json(
      { error: "Unable to restore income. Please try again." },
      { status: 500 }
    );
  }
}
