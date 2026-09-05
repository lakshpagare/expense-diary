import { TrashList } from "@/components/trash/trash-list";

export default function TrashPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Trash</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleted expenses and income. Restore them or remove them permanently.
        </p>
      </div>

      <TrashList />
    </div>
  );
}
