import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma";

interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getAllCourses(filters?: CourseFilters) {
  const where: Prisma.CourseWhereInput = {
    status: "Published",
  };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { smallDescription: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.level) {
    where.level = filters.level as "Beginner" | "Intermediate" | "Advanced";
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters?.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters?.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  const data = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      price: true,
      smallDescription: true,
      slug: true,
      fileKey: true,
      id: true,
      level: true,
      duration: true,
      category: true,
    },
  });

  return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
