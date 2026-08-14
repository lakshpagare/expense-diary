import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const categories = await Category.find({ userId: session.userId }).sort({ name: 1 });
    return NextResponse.json({ categories });
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
      userId: session.userId,
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
