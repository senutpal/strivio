"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-3">
          <Skeleton className="h-6 w-48 mx-auto rounded-md" />
          <Skeleton className="h-4 w-64 mx-auto rounded-md" />
          <Skeleton className="h-4 w-40 mx-auto rounded-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-10 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
