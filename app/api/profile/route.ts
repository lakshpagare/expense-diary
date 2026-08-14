import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || "",
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
        defaultPaymentMethod: user.defaultPaymentMethod,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json(
      { error: "Unable to load profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.userId,
      parsed.data,
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || "",
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
        defaultPaymentMethod: user.defaultPaymentMethod,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { error: "Unable to update profile. Please try again." },
      { status: 500 }
    );
  }
}
