"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PRICE_RUPEES } from "@/lib/subscription";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function SubscribeButton({ userName, userEmail }: { userName: string; userEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Unable to load payment gateway. Check your connection and try again.");
        return;
      }

      const orderRes = await fetch("/api/subscription/create-order", { method: "POST" });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error ?? "Unable to start payment.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Expenses and Incomes Trackers",
        description: "Monthly subscription",
        order_id: orderData.orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#059669" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/subscription/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            toast.error(verifyData.error ?? "Payment verification failed.");
            return;
          }

          toast.success("Subscription activated. Welcome back!");
          router.push("/dashboard");
          router.refresh();
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch {
      toast.error("Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} loading={loading} size="lg" className="w-full">
      Pay ₹{SUBSCRIPTION_PRICE_RUPEES} & Subscribe
    </Button>
  );
}
