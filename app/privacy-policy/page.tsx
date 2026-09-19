import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Expenses and Incomes Trackers",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-brand">
            <Image src="/logo-96.png" alt="Expenses and Incomes Trackers" width={28} height={28} className="rounded-md" />
            <span className="font-semibold">Expenses and Incomes Trackers</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 19, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <p>
              Expenses and Incomes Trackers (&quot;we&quot;, &quot;our&quot;, &quot;the app&quot;) is a personal
              income and expense tracking application. This Privacy Policy explains what
              information we collect, how we use it, and the choices you have. By creating an
              account or using Expenses and Incomes Trackers, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Account information:</span> name,
                email address, phone number, and a securely hashed password (we never store your
                actual password).
              </li>
              <li>
                <span className="font-medium text-foreground">Financial data you enter:</span>{" "}
                expense and income amounts, categories, dates, places, payment methods, notes,
                and any receipt/attachment references you add. This data is entered voluntarily
                by you to use the app&apos;s core features.
              </li>
              <li>
                <span className="font-medium text-foreground">Payment information:</span> if you
                subscribe to a paid plan, payments are processed by Razorpay. We do not store
                your card, UPI, or bank details ourselves — Razorpay handles this securely on
                our behalf.
              </li>
              <li>
                <span className="font-medium text-foreground">Usage data:</span> basic technical
                information such as login timestamps and session activity, used to keep your
                account secure.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>To provide the core functionality of the app — tracking, dashboards, reports, and analytics of your own data.</li>
              <li>To authenticate you and keep your account secure (login, password reset, one-time codes).</li>
              <li>To send you transactional emails (e.g. verification codes, password resets) via our email provider, Resend.</li>
              <li>To process subscription payments via Razorpay, if applicable.</li>
              <li>To send in-app notifications about your own budgets, category limits, or recurring transactions.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We do not sell your personal or financial data to third parties, and we do not use
              your financial data for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Data Storage &amp; Security</h2>
            <p className="mt-3 text-muted-foreground">
              Your data is stored on MongoDB Atlas, a secure cloud database provider, and the
              application is hosted on Vercel. All data in transit is encrypted via HTTPS.
              Passwords are hashed using industry-standard bcrypt hashing and are never stored or
              transmitted in plain text. Every piece of data you create is strictly scoped to
              your account — no other user can access, view, or modify your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Data Retention &amp; Deletion</h2>
            <p className="mt-3 text-muted-foreground">
              When you delete a transaction, it is moved to Trash rather than removed
              immediately, so you can restore it if needed. You can permanently delete items from
              Trash at any time. If you wish to delete your entire account and all associated
              data, please contact us using the details below, and we will process your request
              within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Third-Party Services</h2>
            <p className="mt-3 text-muted-foreground">We rely on the following trusted third-party services to operate the app:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li><span className="font-medium text-foreground">MongoDB Atlas</span> — database hosting</li>
              <li><span className="font-medium text-foreground">Vercel</span> — application hosting</li>
              <li><span className="font-medium text-foreground">Resend</span> — transactional email delivery (verification codes)</li>
              <li><span className="font-medium text-foreground">Razorpay</span> — subscription payment processing</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Each of these providers has its own privacy policy governing how they handle data
              on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
            <p className="mt-3 text-muted-foreground">
              You can view, edit, or delete your expense and income records at any time within
              the app. You can update your profile information from Settings. You may request a
              copy of your data or full account deletion by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Children&apos;s Privacy</h2>
            <p className="mt-3 text-muted-foreground">
              Expenses and Incomes Trackers is not directed at children under 13, and we do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
            <p className="mt-3 text-muted-foreground">
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Contact Us</h2>
            <p className="mt-3 text-muted-foreground">
              If you have questions about this Privacy Policy or wish to exercise your data
              rights, contact us at:{" "}
              <span className="font-medium text-foreground">
                [तुमचा support email इथे टाका]
              </span>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
