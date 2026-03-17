"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function toggleLessonProgress(
  lessonId: string,
  slug: string
): Promise<ApiResponse> {
  const user = await requireUser();
  try {
    const existing = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId,
        },
      },
    });

    if (existing) {
      await prisma.lessonProgress.update({
        where: { id: existing.id },
        data: { completed: !existing.completed },
      });
    } else {
      await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId: lessonId,
          completed: true,
        },
      });
    }

    revalidatePath(`/courses/${slug}/learn`);

    return {
      status: "success",
      message: existing?.completed
        ? "Lesson marked as incomplete"
        : "Lesson marked as complete",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update progress",
    };
  }
}
