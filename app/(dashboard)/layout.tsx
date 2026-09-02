import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSubscriptionState } from "@/lib/subscription";
import { ENABLE_SUBSCRIPTION_GATE } from "@/lib/feature-flags";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect("/login");

  const subscription = getSubscriptionState(user);
  if (ENABLE_SUBSCRIPTION_GATE && !subscription.hasAccess) redirect("/subscribe");

  return (
    <AppShell
      userName={session.name}
      userEmail={session.email}
      subscriptionStatus={subscription.status}
      trialDaysLeft={subscription.trialDaysLeft}
    >
      {children}
    </AppShell>
  );
}
