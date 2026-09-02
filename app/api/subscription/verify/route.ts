import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { SUBSCRIPTION_DAYS } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    }

    // Verify the signature ourselves - never trust the client's word that
    // payment succeeded. This is the standard Razorpay HMAC verification.
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    await connectDB();

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: session.userId,
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Extend from the later of "now" or the current expiry, so renewing
    // early (before the current period ends) doesn't forfeit paid days.
    const currentExpiry = user.subscriptionExpiresAt;
    const baseDate = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + SUBSCRIPTION_DAYS);

    user.subscriptionStatus = "active";
    user.subscriptionExpiresAt = newExpiry;
    await user.save();

    return NextResponse.json({ success: true, subscriptionExpiresAt: newExpiry });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json(
      { error: "Unable to verify payment. Please contact support if the amount was deducted." },
      { status: 500 }
    );
  }
}
