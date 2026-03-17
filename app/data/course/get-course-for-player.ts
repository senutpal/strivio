import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourseForPlayer(slug: string) {
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
              thumbnailKey: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  return course;
}

export type PlayerCourseType = Awaited<ReturnType<typeof getCourseForPlayer>>;
export type PlayerLessonType = PlayerCourseType["chapters"][0]["lessons"][0];
