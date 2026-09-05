export default function TrashLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="space-y-2">
        <div className="skeleton h-7 w-32 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
