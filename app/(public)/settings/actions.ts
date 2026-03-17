"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function updateProfile(formData: FormData): Promise<ApiResponse> {
  const user = await requireUser();
  try {
    const result = updateProfileSchema.safeParse({
      name: formData.get("name"),
    });

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid name",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { name: result.data.name },
    });

    revalidatePath("/settings");

    return {
      status: "success",
      message: "Profile updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update profile",
    };
  }
}
