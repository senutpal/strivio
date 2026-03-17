"use server";

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);
export async function enrollInCourseAction(
  courseId: string
): Promise<ApiResponse | never> {
  const user = await requireUser();
  let checkoutUrl;
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });
    if (decision.isDenied()) {
      return {
        status: "error",
        message: "You have been blocked",
      };
    }
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    let stripeCustomerId: string;
    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: stripeCustomerId,
        },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },

        select: {
          status: true,
          id: true,
        },
      });

      if (existingEnrollment?.status === "Active") {
        return {
          status: "success",
          message: "You are already enrolled in this course",
        };
      }

      let enrollment;

      if (existingEnrollment) {
        enrollment = await tx.enrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            amount: course.price,
            status: "Pending",
            updatedAt: new Date(),
          },
        });
      } else {
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            amount: course.price,
            status: "Pending",
          },
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: course.title,
              },
              unit_amount: course.price * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: user.id,
          courseId: course.id,
          enrollmentId: enrollment.id,
        },
      });
      return {
        enrollment: enrollment,
        checkoutUrl: checkoutSession.url,
      };
    });
    checkoutUrl = result.checkoutUrl as string;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        status: "error",
        message: "Payment System Error, Please try again later",
      };
    }
    return {
      status: "error",
      message: "Failed to enroll in course",
    };
  }
  redirect(checkoutUrl);
}

export async function submitReviewAction(
  courseId: string,
  rating: number,
  comment: string
): Promise<ApiResponse> {
  const user = await requireUser();
  try {
    if (rating < 1 || rating > 5) {
      return { status: "error", message: "Rating must be between 1 and 5" };
    }
    if (!comment || comment.length < 3) {
      return {
        status: "error",
        message: "Review must be at least 3 characters",
      };
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId },
      },
      select: { status: true },
    });

    if (enrollment?.status !== "Active") {
      return {
        status: "error",
        message: "You must be enrolled to review this course",
      };
    }

    const existing = await prisma.review.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId },
      },
    });

    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment },
      });
    } else {
      await prisma.review.create({
        data: {
          userId: user.id,
          courseId,
          rating,
          comment,
        },
      });
    }

    revalidatePath(`/courses`);

    return {
      status: "success",
      message: existing ? "Review updated" : "Review submitted",
    };
  } catch {
    return { status: "error", message: "Failed to submit review" };
  }
}

export async function toggleWishlistAction(
  courseId: string
): Promise<ApiResponse> {
  const user = await requireUser();
  try {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      revalidatePath(`/courses`);
      return { status: "success", message: "Removed from wishlist" };
    }

    await prisma.wishlist.create({
      data: { userId: user.id, courseId },
    });

    revalidatePath(`/courses`);
    return { status: "success", message: "Added to wishlist" };
  } catch {
    return { status: "error", message: "Failed to update wishlist" };
  }
}
