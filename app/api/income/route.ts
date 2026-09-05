import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Income from "@/models/Income";
import { getSession } from "@/lib/auth";
import { incomeSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit-log";

// GET /api/income?search=&category=&incomeType=&dateFrom=&dateTo=&amountMin=&amountMax=&page=&limit=
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
    const incomeType = searchParams.get("incomeType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const amountMin = searchParams.get("amountMin");
    const amountMax = searchParams.get("amountMax");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));

    const query: Record<string, unknown> = { userId: session.userId };

    if (category && category !== "all") query.category = category;
    if (incomeType && incomeType !== "all") query.incomeType = incomeType;

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
        { source: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Income.countDocuments(query);
    const income = await Income.find(query)
      .sort({ date: -1, time: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      income,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("List income error:", err);
    return NextResponse.json({ error: "Unable to load income." }, { status: 500 });
  }
}

// POST /api/income
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = incomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const income = await Income.create({
      ...parsed.data,
      userId: session.userId,
    });

    await recordAuditLog({
      userId: session.userId,
      action: "TRANSACTION_CREATED",
      transactionType: "income",
      transactionId: income._id.toString(),
    });

    return NextResponse.json({ income }, { status: 201 });
  } catch (err) {
    console.error("Create income error:", err);
    return NextResponse.json(
      { error: "Unable to save income. Please try again." },
      { status: 500 }
    );
  }
}
