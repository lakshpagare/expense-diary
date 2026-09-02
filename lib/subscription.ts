export const TRIAL_DAYS = 5;
export const SUBSCRIPTION_DAYS = 30;
export const SUBSCRIPTION_PRICE_RUPEES = 49;
export const SUBSCRIPTION_PRICE_PAISE = SUBSCRIPTION_PRICE_RUPEES * 100;

export interface SubscriptionUserFields {
  trialEndsAt: Date | string;
  subscriptionStatus: "trial" | "active" | "expired";
  subscriptionExpiresAt?: Date | string | null;
}

export interface SubscriptionState {
  hasAccess: boolean;
  status: "trial" | "active" | "expired";
  trialDaysLeft: number; // 0 if trial has ended
  trialEndsAt: Date;
  subscriptionExpiresAt: Date | null;
}

/**
 * Computes the current, real-time subscription state from a user's stored
 * fields. This is always derived fresh (never trusts a stale "active" flag
 * past its expiry date) so a lapsed subscription is caught immediately.
 */
export function getSubscriptionState(user: SubscriptionUserFields): SubscriptionState {
  const now = new Date();
  const trialEndsAt = new Date(user.trialEndsAt);
  const subscriptionExpiresAt = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt)
    : null;

  const subscriptionActive = !!subscriptionExpiresAt && subscriptionExpiresAt > now;
  const trialActive = !subscriptionActive && trialEndsAt > now;

  const trialDaysLeft = trialActive
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  let status: SubscriptionState["status"];
  if (subscriptionActive) status = "active";
  else if (trialActive) status = "trial";
  else status = "expired";

  return {
    hasAccess: subscriptionActive || trialActive,
    status,
    trialDaysLeft,
    trialEndsAt,
    subscriptionExpiresAt,
  };
}

export function newTrialEndDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d;
}
