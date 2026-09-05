export default function BudgetsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-7 w-40 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-40 rounded-2xl" />
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}
