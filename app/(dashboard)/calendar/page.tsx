import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See your income and expenses laid out by day.
        </p>
      </div>

      <CalendarView />
    </div>
  );
}
