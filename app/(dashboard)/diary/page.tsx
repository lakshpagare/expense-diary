"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Expense Diary
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your daily spending with detailed entries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diary Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg bg-muted/50 py-20">
            <p className="text-sm text-muted-foreground">
              Diary view coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
