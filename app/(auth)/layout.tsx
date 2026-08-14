import { BookOpenText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-charcoal p-10 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #10b981 0%, transparent 40%), radial-gradient(circle at 80% 80%, #059669 0%, transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <BookOpenText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Expense Diary</span>
        </div>

        <div className="relative space-y-4">
          <h1 className="text-3xl font-semibold leading-tight">
            Track every rupee.
            <br />
            Understand every expense.
          </h1>
          <p className="max-w-sm text-sm text-slate-300">
            A daily expense diary that shows you exactly where your money
            goes — by category, place, and time of day — so budgeting stops
            feeling like guesswork.
          </p>
        </div>

        <p className="relative text-xs text-slate-400">
          © {new Date().getFullYear()} Expense Diary. Built for people who
          want to actually understand their spending.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
