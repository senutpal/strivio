"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchema";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export async function editCourse(
  data: CourseSchemaType,
  courseId: string
): Promise<ApiResponse> {
  const user = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.user.id,
    });
    if (decision.isDenied()) {
      return {
        message: "Try again after some time ",
        status: "error",
      };
    }
    const result = courseSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid Data",
      };
    }

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.user.id,
      },
      data: {
        ...result.data,
      },
    });
    return {
      status: "success",
      message: "Course Updated Successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update course",
    };
  }
}

export async function reorderLessons(
  chapterId: string,
  lessons: {
    id: string;
    position: number;
  }[],
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    if (!lessons || lessons.length < 0) {
      return {
        status: "error",
        message: "No lessons provided for reordering",
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: {
          id: lesson.id,
          chapterId: chapterId,
        },
        data: {
          position: lesson.position,
        },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/couses/${courseId}/edit`);

    return {
      message: "Lessons Reordered Sucessfully ",
      status: "success",
    };
  } catch {
    return {
      message: "Try again after some time ",
      status: "error",
    };
  }
}

export async function reorderChapters(
  courseId: string,
  chapters: { id: string; position: number }[]
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    if (!chapters || chapters.length < 0) {
      return {
        status: "error",
        message: "No chapters provied for recording ",
      };
    }
    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId: courseId,
        },
        data: {
          position: chapter.position,
        },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/couses/${courseId}/edit`);

    return {
      message: "Chapters Reordered Sucessfully ",
      status: "success",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to reorder Chapters",
    };
  }
}
