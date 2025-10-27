"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tryCatch } from "@/hooks/try-catch";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCourse } from "./actions";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteCourseRoute() {
  const [pending, startTransition] = useTransition();
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  function onSubmit() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(deleteCourse(courseId));

      if (error) {
        toast.error("Unexpected Error Occurred");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }
  return (
    <div
      className="max-w-xl mx-auto
     w-full"
    >
      <Card className="mt-32">
        <CardHeader>
          <CardTitle>Are you sure you want to delete this course ?</CardTitle>
          <CardDescription>This action can not be undone</CardDescription>
        </CardHeader>
        <CardContent className=" flex items-center justify-between">
          <Link
            className={buttonVariants({
              variant: "outline",
            })}
            href="/admin/courses"
          >
            Cancel
          </Link>
          <Button onClick={onSubmit} disabled={pending} variant="destructive">
            {pending ? (
              <>
                <Loader2 className="animate-spin size-4" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
