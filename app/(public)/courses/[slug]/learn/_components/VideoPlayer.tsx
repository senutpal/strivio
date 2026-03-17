"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { IconCheck, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { toggleLessonProgress } from "../actions";

interface VideoPlayerProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    videoKey: string | null;
  };
  slug: string;
  isCompleted: boolean;
  nextLesson: { id: string; title: string } | null;
  prevLesson: { id: string; title: string } | null;
}

export function VideoPlayer({
  lesson,
  slug,
  isCompleted,
  nextLesson,
  prevLesson,
}: VideoPlayerProps) {
  const [isPending, startTransition] = useTransition();

  const videoUrl = lesson.videoKey
    ? `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME}.t3.storage.dev/${lesson.videoKey}`
    : null;

  function handleToggleComplete() {
    startTransition(async () => {
      const result = await toggleLessonProgress(lesson.id, slug);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {videoUrl ? (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              key={lesson.id}
              controls
              className="w-full h-full"
              src={videoUrl}
              autoPlay
            />
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No video available for this lesson</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <Button
            variant={isCompleted ? "outline" : "default"}
            onClick={handleToggleComplete}
            disabled={isPending}
            size="sm"
          >
            <IconCheck className="size-4 mr-1" />
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
        </div>

        {lesson.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{lesson.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          {prevLesson ? (
            <Button variant="outline" asChild>
              <Link href={`/courses/${slug}/learn?lesson=${prevLesson.id}`}>
                <IconChevronLeft className="size-4 mr-1" />
                Previous
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Button asChild>
              <Link href={`/courses/${slug}/learn?lesson=${nextLesson.id}`}>
                Next
                <IconChevronRight className="size-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
