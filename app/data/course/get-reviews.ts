import { prisma } from "@/lib/db";

export async function getCourseReviews(courseId: string) {
  const data = await prisma.review.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return data;
}

export async function getCourseAverageRating(courseId: string) {
  const result = await prisma.review.aggregate({
    where: { courseId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  };
}

export type CourseReviewType = Awaited<ReturnType<typeof getCourseReviews>>[0];
