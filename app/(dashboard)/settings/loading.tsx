export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-7 w-40 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>
      <div className="skeleton h-80 rounded-2xl" />
      <div className="skeleton h-40 rounded-2xl" />
    </div>
  );
}
