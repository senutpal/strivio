import { prisma } from "@/lib/db";

export async function getUserWishlist(userId: string) {
  const data = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      courseId: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
          price: true,
          duration: true,
          level: true,
          category: true,
          smallDescription: true,
        },
      },
    },
  });

  return data;
}

export async function isInWishlist(userId: string, courseId: string): Promise<boolean> {
  const item = await prisma.wishlist.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    select: { id: true },
  });

  return !!item;
}
