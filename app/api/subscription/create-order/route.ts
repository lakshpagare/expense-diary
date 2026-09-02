import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { SUBSCRIPTION_PRICE_PAISE, SUBSCRIPTION_DAYS } from "@/lib/subscription";
import { todayISO } from "@/lib/utils";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  try {
    await connectDB();

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: SUBSCRIPTION_PRICE_PAISE,
      currency: "INR",
      receipt: `sub_${session.userId}_${Date.now()}`,
      notes: { userId: session.userId, purpose: "expense-diary-subscription" },
    });

    const periodStart = todayISO();
    const periodEndDate = new Date();
    periodEndDate.setDate(periodEndDate.getDate() + SUBSCRIPTION_DAYS);
    const periodEnd = periodEndDate.toISOString().slice(0, 10);

    await Payment.create({
      userId: session.userId,
      razorpayOrderId: order.id,
      amount: SUBSCRIPTION_PRICE_PAISE / 100,
      status: "created",
      periodStart,
      periodEnd,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: "Unable to start payment. Please try again." },
      { status: 500 }
    );
  }
}
