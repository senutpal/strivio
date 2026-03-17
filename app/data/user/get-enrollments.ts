import { prisma } from "@/lib/db";

export async function getUserEnrollments(userId: string) {
  const data = await prisma.enrollment.findMany({
    where: {
      userId: userId,
      status: "Active",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      Course: {
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
          duration: true,
          level: true,
          category: true,
          chapters: {
            select: {
              id: true,
              lessons: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return data;
}

export type UserEnrollmentType = Awaited<ReturnType<typeof getUserEnrollments>>[0];
