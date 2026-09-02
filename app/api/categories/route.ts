import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Expense from "@/models/Expense";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const categories = await Category.find({ userId: session.userId }).sort({ name: 1 }).lean();

    const { searchParams } = new URL(req.url);
    if (searchParams.get("withSpend") !== "1") {
      return NextResponse.json({ categories });
    }

    // Attach current month's spend per category, for the Categories page's
    // limit progress bars. Kept behind a query param so the lightweight
    // form-picker usage elsewhere doesn't pay this extra cost.
    const uid = new mongoose.Types.ObjectId(session.userId);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const spendAgg = await Expense.aggregate([
      { $match: { userId: uid, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);
    const spendByCategory = new Map(spendAgg.map((r) => [r._id as string, r.total as number]));

    const categoriesWithSpend = categories.map((c) => ({
      ...c,
      monthlySpend: spendByCategory.get(c.name) ?? 0,
    }));

    return NextResponse.json({ categories: categoriesWithSpend });
  } catch (err) {
    console.error("List categories error:", err);
    return NextResponse.json({ error: "Unable to load categories." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Category.findOne({
      userId: session.userId,
      name: parsed.data.name,
    });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 }
      );
    }

    const category = await Category.create({
      ...parsed.data,
      monthlyLimit: parsed.data.monthlyLimit ?? undefined,
      userId: session.userId,
      isDefault: false,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json(
      { error: "Unable to create category. Please try again." },
      { status: 500 }
    );
  }
}
