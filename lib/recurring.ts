export type AnyFrequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

function addPeriod(date: Date, frequency: AnyFrequency): Date {
  const d = new Date(date);
  switch (frequency) {
    case "Daily":
      d.setDate(d.getDate() + 1);
      break;
    case "Weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "Monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "Yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d;
}

/**
 * Given a start date and frequency, returns the first occurrence that is
 * today or later (as YYYY-MM-DD). Used both when creating a recurring item
 * (to seed nextDueDate) and after logging an occurrence (to advance it).
 */
export function computeNextDueDate(startDate: string, frequency: AnyFrequency): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(`${startDate}T00:00:00`);
  if (cursor >= today) {
    return cursor.toISOString().slice(0, 10);
  }

  // Fast-forward from the start date to the next occurrence on/after today.
  // Guard against pathological infinite loops with a sane iteration cap.
  for (let i = 0; i < 10000 && cursor < today; i++) {
    cursor = addPeriod(cursor, frequency);
  }

  return cursor.toISOString().slice(0, 10);
}

export function advanceDueDate(currentDueDate: string, frequency: AnyFrequency): string {
  const next = addPeriod(new Date(`${currentDueDate}T00:00:00`), frequency);
  return next.toISOString().slice(0, 10);
}
