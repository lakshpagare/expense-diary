import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ENABLE_SUBSCRIPTION_GATE } from "@/lib/feature-flags";

export function TrialBanner({
  status,
  trialDaysLeft,
}: {
  status: "trial" | "active" | "expired";
  trialDaysLeft: number;
}) {
  if (!ENABLE_SUBSCRIPTION_GATE) return null;
  if (status !== "trial") return null;

  return (
    <Link
      href="/subscribe"
      className="flex items-center justify-center gap-2 bg-brand px-4 py-2 text-center text-xs font-medium text-brand-foreground transition-colors hover:brightness-110 sm:text-sm"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0" />
      {trialDaysLeft > 0
        ? `Your free trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}. Subscribe for ₹49/month to keep access.`
        : "Your free trial ends today. Subscribe for ₹49/month to keep access."}
      <span className="underline underline-offset-2">Subscribe now</span>
    </Link>
  );
}
