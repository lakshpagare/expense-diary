"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema } from "@/lib/validations";
import { PAYMENT_METHODS } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";

type ProfileInput = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  defaultValues: {
    name: string;
    email: string;
    currency: string;
    monthlyBudget: number;
    defaultPaymentMethod: (typeof PAYMENT_METHODS)[number];
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues.name,
      currency: defaultValues.currency,
      monthlyBudget: defaultValues.monthlyBudget,
      defaultPaymentMethod: defaultValues.defaultPaymentMethod,
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Unable to update profile.");
        return;
      }

      toast.success("Profile updated successfully.");
      router.refresh();
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Update your personal details and default preferences.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} error={!!errors.name} />
              <FormError message={errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={defaultValues.email} disabled />
              <p className="mt-1.5 text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="INR" {...register("currency")} error={!!errors.currency} />
              <FormError message={errors.currency?.message} />
            </div>
            <div>
              <Label htmlFor="monthlyBudget">Monthly Budget</Label>
              <Input
                id="monthlyBudget"
                type="number"
                step="0.01"
                {...register("monthlyBudget", { valueAsNumber: true })}
                error={!!errors.monthlyBudget}
              />
              <FormError message={errors.monthlyBudget?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
            <Select
              id="defaultPaymentMethod"
              {...register("defaultPaymentMethod")}
              error={!!errors.defaultPaymentMethod}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <FormError message={errors.defaultPaymentMethod?.message} />
          </div>

          <FormError message={serverError ?? undefined} />

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
