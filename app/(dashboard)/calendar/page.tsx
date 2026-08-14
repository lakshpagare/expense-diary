"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your expenses on a calendar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg bg-muted/50 py-20">
            <p className="text-sm text-muted-foreground">
              Calendar integration coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
