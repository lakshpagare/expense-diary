export default function CalendarLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="space-y-2">
        <div className="skeleton h-7 w-40 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>
      <div className="skeleton h-[460px] rounded-2xl" />
    </div>
  );
}
