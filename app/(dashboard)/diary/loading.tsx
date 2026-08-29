export default function DiaryLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2">
        <div className="skeleton h-7 w-48 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-64 rounded-2xl" />
      ))}
    </div>
  );
}
