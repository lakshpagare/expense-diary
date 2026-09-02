import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";
import { categorySchema, categoryLimitSchema } from "@/lib/validations";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  try {
    await connectDB();

    const existing = await Category.findOne({ _id: id, userId: session.userId });
    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const body = await req.json();

    // Default (inbuilt) categories can only have their monthly limit
    // changed - name/icon/color are fixed. Custom categories can edit
    // everything.
    if (existing.isDefault) {
      const parsed = categoryLimitSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid input" },
          { status: 400 }
        );
      }
      existing.monthlyLimit = parsed.data.monthlyLimit ?? undefined;
      await existing.save();
      return NextResponse.json({ category: existing });
    }

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ category });
  } catch (err) {
    console.error("Update category error:", err);
    return NextResponse.json(
      { error: "Unable to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  try {
    await connectDB();

    const existing = await Category.findOne({ _id: id, userId: session.userId });
    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Default categories cannot be deleted." },
        { status: 403 }
      );
    }

    await existing.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json(
      { error: "Unable to delete category." },
      { status: 500 }
    );
  }
}
