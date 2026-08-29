export default function ReportsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-2">
        <div className="skeleton h-7 w-56 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="skeleton h-6 w-48 rounded-lg" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
