import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PRICE_RUPEES, type SubscriptionState } from "@/lib/subscription";

export function SubscriptionStatusCard({ subscription }: { subscription: SubscriptionState }) {
  const { status, trialDaysLeft, subscriptionExpiresAt } = subscription;

  return (
    <Card>
      <CardContent>
        <h2 className="text-base font-semibold text-foreground">Subscription</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your Expenses and Incomes Trackers plan.
        </p>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
          {status === "active" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          ) : status === "trial" ? (
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          )}

          <div className="min-w-0 flex-1">
            {status === "active" && (
              <>
                <p className="text-sm font-medium text-foreground">Active subscription</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  ₹{SUBSCRIPTION_PRICE_RUPEES}/month · renews on{" "}
                  {subscriptionExpiresAt?.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </>
            )}
            {status === "trial" && (
              <>
                <p className="text-sm font-medium text-foreground">Free trial</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free trial.`
                    : "Your free trial ends today."}
                </p>
              </>
            )}
            {status === "expired" && (
              <>
                <p className="text-sm font-medium text-foreground">Subscription expired</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Subscribe again to regain access to your account.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Link href="/subscribe">
            <Button variant={status === "active" ? "outline" : "primary"}>
              {status === "active" ? "Manage Subscription" : "Subscribe"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
