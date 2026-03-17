"use client";

import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconCheck, IconPlayerPlay } from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface CourseSidebarProps {
  course: {
    title: string;
    slug: string;
    chapters: {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
      }[];
    }[];
  };
  completedIds: Set<string>;
  activeLessonId: string;
  completedCount: number;
  totalLessons: number;
}

export function CourseSidebar({
  course,
  completedIds,
  activeLessonId,
  completedCount,
  totalLessons,
}: CourseSidebarProps) {
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <aside className="w-full lg:w-80 lg:min-w-80 border-r bg-muted/30 lg:min-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg truncate">{course.title}</h2>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {totalLessons} lessons</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </div>
      <div className="p-2">
        {course.chapters.map((chapter, index) => (
          <Collapsible key={chapter.id} defaultOpen={chapter.lessons.some((l) => l.id === activeLessonId)}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center gap-2 text-left">
                <span className="text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{chapter.title}</span>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-4 space-y-1 pb-2">
                {chapter.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = completedIds.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.slug}/learn?lesson=${lesson.id}`}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <div className="flex items-center justify-center size-5 rounded-full bg-green-500/10">
                          <IconCheck className="size-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center size-5 rounded-full border">
                          <IconPlayerPlay className="size-3" />
                        </div>
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </aside>
  );
}
