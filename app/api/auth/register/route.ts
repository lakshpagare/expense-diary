import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Category from "@/models/Category";
import { registerSchema } from "@/lib/validations";
import { setSessionCookie } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({ name, email, password });

    // Seed default categories for the new user
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({
        userId: user._id,
        name: c.name,
        icon: c.icon,
        color: c.color,
      }))
    );

    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}
