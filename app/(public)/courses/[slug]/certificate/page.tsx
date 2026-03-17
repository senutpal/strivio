import { requireUser } from "@/app/data/user/require-user";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { IconAward } from "@tabler/icons-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "./_components/PrintButton";

type Params = Promise<{ slug: string }>;

export default async function CertificatePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      category: true,
      duration: true,
      chapters: {
        select: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: user.id, courseId: course.id },
    },
    select: { status: true },
  });

  if (enrollment?.status !== "Active") {
    redirect(`/courses/${slug}`);
  }

  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  );

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId: user.id,
      completed: true,
      lesson: {
        chapter: { courseId: course.id },
      },
    },
  });

  if (completedLessons < totalLessons) {
    redirect(`/courses/${slug}/learn`);
  }

  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="w-full max-w-3xl border-4 border-primary/20 rounded-xl p-12 bg-gradient-to-br from-primary/5 to-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/50 to-primary" />

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="rounded-full bg-primary/10 p-4">
            <IconAward className="size-16 text-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Certificate of Completion
            </p>
            <h1 className="text-4xl font-bold tracking-tight">
              Congratulations!
            </h1>
          </div>

          <div className="space-y-1">
            <p className="text-lg text-muted-foreground">
              This certifies that
            </p>
            <p className="text-3xl font-bold text-primary">{user.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-lg text-muted-foreground">
              has successfully completed the course
            </p>
            <p className="text-2xl font-semibold">{course.title}</p>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <span>{course.duration} hours</span>
            <span>{course.category}</span>
            <span>{completionDate}</span>
          </div>

          <div className="pt-6 border-t w-48">
            <p className="text-xs text-muted-foreground">Strivio</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <PrintButton />
      </div>
    </div>
  );
}
