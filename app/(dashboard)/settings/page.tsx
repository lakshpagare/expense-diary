import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSubscriptionState } from "@/lib/subscription";
import { ENABLE_SUBSCRIPTION_GATE } from "@/lib/feature-flags";
import { ProfileForm } from "@/components/settings/profile-form";
import { SubscriptionStatusCard } from "@/components/settings/subscription-status-card";

export default async function SettingsPage() {
  const session = await getSession();
  const userId = session!.userId;

  await connectDB();
  const user = await User.findById(userId).lean();

  if (!user) {
    return null;
  }

  const subscription = getSubscriptionState(user);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile.</p>
      </div>

      <ProfileForm
        defaultValues={{
          name: user.name,
          email: user.email,
          currency: user.currency,
          monthlyBudget: user.monthlyBudget,
          defaultPaymentMethod: user.defaultPaymentMethod,
        }}
      />

      {ENABLE_SUBSCRIPTION_GATE && <SubscriptionStatusCard subscription={subscription} />}
    </div>
  );
}
