import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import { getSession } from "@/lib/auth";
import { expenseSchema } from "@/lib/validations";

// GET /api/expenses?search=&category=&paymentMethod=&place=&dateFrom=&dateTo=&amountMin=&amountMax=&page=&limit=
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const paymentMethod = searchParams.get("paymentMethod");
    const place = searchParams.get("place");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const amountMin = searchParams.get("amountMin");
    const amountMax = searchParams.get("amountMax");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));

    const query: Record<string, unknown> = { userId: session.userId };

    if (category && category !== "all") query.category = category;
    if (paymentMethod && paymentMethod !== "all") query.paymentMethod = paymentMethod;
    if (place) query.place = { $regex: place, $options: "i" };

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, string> = {};
      if (dateFrom) dateFilter.$gte = dateFrom;
      if (dateTo) dateFilter.$lte = dateTo;
      query.date = dateFilter;
    }

    if (amountMin || amountMax) {
      const amountFilter: Record<string, number> = {};
      if (amountMin) amountFilter.$gte = Number(amountMin);
      if (amountMax) amountFilter.$lte = Number(amountMax);
      query.amount = amountFilter;
    }

    if (search) {
      query.$or = [
        { place: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { paymentMethod: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, time: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("List expenses error:", err);
    return NextResponse.json(
      { error: "Unable to load expenses." },
      { status: 500 }
    );
  }
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = expenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const expense = await Expense.create({
      ...parsed.data,
      userId: session.userId,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    console.error("Create expense error:", err);
    return NextResponse.json(
      { error: "Unable to save expense. Please try again." },
      { status: 500 }
    );
  }
}
