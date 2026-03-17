import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <div className="rounded-full bg-red-500/10 p-4">
            <IconX className="size-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Cancelled</h1>
          <p className="text-muted-foreground">
            Your payment was cancelled. No charges were made. You can try again
            whenever you&apos;re ready.
          </p>
          <div className="flex gap-3 mt-4">
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
