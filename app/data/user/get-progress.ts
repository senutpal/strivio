import { prisma } from "@/lib/db";

export async function getCourseProgress(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      chapters: {
        select: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!course) return { completed: 0, total: 0, percentage: 0 };

  const totalLessons = course.chapters.reduce(
    (sum, chapter) => sum + chapter.lessons.length,
    0
  );

  if (totalLessons === 0) return { completed: 0, total: 0, percentage: 0 };

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId: userId,
      completed: true,
      lesson: {
        chapter: {
          courseId: courseId,
        },
      },
    },
  });

  return {
    completed: completedLessons,
    total: totalLessons,
    percentage: Math.round((completedLessons / totalLessons) * 100),
  };
}
