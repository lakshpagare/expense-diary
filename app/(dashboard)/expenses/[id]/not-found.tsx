import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExpenseNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-foreground">Expense not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This expense may have been deleted, or the link is incorrect.
      </p>
      <Link href="/expenses" className="mt-5">
        <Button variant="outline">Back to all expenses</Button>
      </Link>
    </div>
  );
}
