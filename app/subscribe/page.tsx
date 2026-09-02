import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenText, Check, LogOut, ArrowLeft } from "lucide-react";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSubscriptionState, SUBSCRIPTION_PRICE_RUPEES } from "@/lib/subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscribeButton } from "@/components/subscription/subscribe-button";

const FEATURES = [
  "Unlimited income & expense tracking",
  "Dashboard, calendar, and diary views",
  "Full reports & financial insights",
  "Budgets, recurring transactions & savings goals",
];

async function logout() {
  "use server";
  await clearSessionCookie();
  redirect("/login");
}

export default async function SubscribePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect("/login");

  const subscription = getSubscriptionState(user);

  const heading =
    subscription.status === "active"
      ? "You're subscribed"
      : subscription.status === "trial"
        ? "Lock in your plan"
        : "Your free trial has ended";

  const subheading =
    subscription.status === "active"
      ? `Your subscription renews on ${subscription.subscriptionExpiresAt?.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. You can renew early below to extend it further.`
      : subscription.status === "trial"
        ? `${subscription.trialDaysLeft} day${subscription.trialDaysLeft === 1 ? "" : "s"} left in your free trial. Subscribe now for ₹${SUBSCRIPTION_PRICE_RUPEES}/month to keep uninterrupted access.`
        : `Subscribe for ₹${SUBSCRIPTION_PRICE_RUPEES}/month to keep full access to your Expense Diary.`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-brand">
          <BookOpenText className="h-6 w-6" />
          <span className="font-semibold">Expense Diary</span>
        </div>

        <Card>
          <CardContent className="space-y-5">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-foreground">{heading}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{subheading}</p>
            </div>

            <ul className="space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-muted/60 p-4 text-center">
              <p className="text-3xl font-semibold text-foreground">
                ₹{SUBSCRIPTION_PRICE_RUPEES}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
            </div>

            <SubscribeButton userName={session.name} userEmail={session.email} />

            <p className="text-center text-xs text-muted-foreground">
              Secure payment powered by Razorpay. Cards, UPI, and net banking supported.
            </p>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-2">
          {subscription.hasAccess && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to dashboard
              </Button>
            </Link>
          )}
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
