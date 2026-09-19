import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          suppressHydrationWarning
          className={cn(
            "flex h-11 w-full appearance-none rounded-xl border bg-card px-3.5 pr-9 text-sm text-foreground transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive" : "border-border",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
