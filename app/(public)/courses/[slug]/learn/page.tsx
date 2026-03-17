import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { CourseSidebar } from "./_components/CourseSidebar";
import { VideoPlayer } from "./_components/VideoPlayer";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ lesson?: string }>;

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { lesson: activeLessonId } = await searchParams;
  const user = await requireUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              videoKey: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    select: { status: true },
  });

  if (enrollment?.status !== "Active") {
    redirect(`/courses/${slug}`);
  }

  const completedLessons = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      completed: true,
      lesson: {
        chapter: {
          courseId: course.id,
        },
      },
    },
    select: { lessonId: true },
  });

  const completedIds = new Set(completedLessons.map((l) => l.lessonId));

  const allLessons = course.chapters.flatMap((ch) => ch.lessons);
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;

  const currentLesson = activeLessonId
    ? allLessons.find((l) => l.id === activeLessonId) ?? allLessons[0]
    : allLessons[0];

  if (!currentLesson) return notFound();

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const nextLesson = allLessons[currentIndex + 1] ?? null;
  const prevLesson = allLessons[currentIndex - 1] ?? null;

  return (
    <div className="flex flex-col lg:flex-row gap-0 -mx-4 md:-mx-6 lg:-mx-8 -mt-5">
      <CourseSidebar
        course={course}
        completedIds={completedIds}
        activeLessonId={currentLesson.id}
        completedCount={completedCount}
        totalLessons={totalLessons}
      />
      <VideoPlayer
        lesson={currentLesson}
        slug={slug}
        isCompleted={completedIds.has(currentLesson.id)}
        nextLesson={nextLesson}
        prevLesson={prevLesson}
      />
    </div>
  );
}
