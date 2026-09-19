import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        // Browser extensions (password managers / form-fillers) inject
        // attributes like `fdprocessedid` onto inputs after the page loads,
        // which never exist in the server-rendered HTML. That's a benign,
        // extension-caused attribute mismatch, not an app bug - this tells
        // React not to warn about it, without disabling hydration checks
        // for anything else on this element.
        suppressHydrationWarning
        className={cn(
          "flex h-11 w-full rounded-xl border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-border",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
