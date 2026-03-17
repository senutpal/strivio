import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <div className="rounded-full bg-green-500/10 p-4">
            <IconCircleCheck className="size-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your enrollment has been confirmed. You can now access all course
            materials from your dashboard.
          </p>
          <div className="flex gap-3 mt-4">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
