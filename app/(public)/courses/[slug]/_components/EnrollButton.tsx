"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { enrollInCourseAction } from "../actions";
import Link from "next/link";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  slug: string;
}

export function EnrollButton({ courseId, isEnrolled, slug }: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (isEnrolled) {
    return (
      <Button className="w-full" asChild>
        <Link href={`/courses/${slug}/learn`}>Continue Learning</Link>
      </Button>
    );
  }

  function handleEnroll() {
    startTransition(async () => {
      const result = await enrollInCourseAction(courseId);
      if (result && result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button className="w-full" onClick={handleEnroll} disabled={isPending}>
      {isPending ? "Processing..." : "Enroll Now!"}
    </Button>
  );
}
