import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, courseId, enrollmentId } = session.metadata || {};

    if (!userId || !courseId || !enrollmentId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "Active" },
    });

    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
      prisma.course.findUnique({ where: { id: courseId }, select: { title: true, slug: true } }),
    ]);

    if (user && course) {
      await resend.emails.send({
        from: "Strivio <onboarding@resend.dev>",
        to: [user.email],
        subject: `Enrollment Confirmed: ${course.title}`,
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to ${course.title}!</h2>
            <p>Hi ${user.name},</p>
            <p>Your enrollment has been confirmed. You can now access all course materials.</p>
            <a href="${env.BETTER_AUTH_URL}/courses/${course.slug}/learn" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Start Learning</a>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ received: true });
}
