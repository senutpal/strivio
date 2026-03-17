import { requireUser } from "@/app/data/user/require-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { IconBook, IconClock, IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: "Active" },
    orderBy: { createdAt: "desc" },
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
              lessons: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalLessons = enrollment.Course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0
      );

      const completedLessons = await prisma.lessonProgress.count({
        where: {
          userId: user.id,
          completed: true,
          lesson: {
            chapter: {
              courseId: enrollment.Course.id,
            },
          },
        },
      });

      return {
        ...enrollment,
        totalLessons,
        completedLessons,
        percentage:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
      };
    })
  );

  return (
    <div className="mt-5">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          My Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress and continue where you left off
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <IconBook className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-3">
                <IconPlayerPlay className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {enrollmentsWithProgress.filter((e) => e.percentage > 0 && e.percentage < 100).length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-500/10 p-3">
                <IconClock className="size-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {enrollmentsWithProgress.filter((e) => e.percentage === 100).length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="mb-8" />

      <h2 className="text-2xl font-semibold mb-6">My Courses</h2>

      {enrollmentsWithProgress.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <IconBook className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your learning journey by enrolling in a course
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollmentsWithProgress.map((enrollment) => {
            const thumbnailUrl = `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME}.t3.storage.dev/${enrollment.Course.fileKey}`;
            return (
              <Card key={enrollment.id} className="group py-0 gap-0">
                <div className="relative">
                  <Image
                    width={600}
                    height={400}
                    className="w-full rounded-t-xl aspect-video object-cover"
                    src={thumbnailUrl}
                    alt={enrollment.Course.title}
                  />
                  {enrollment.percentage === 100 && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Completed
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <Link
                    href={`/courses/${enrollment.Course.slug}/learn`}
                    className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
                  >
                    {enrollment.Course.title}
                  </Link>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {enrollment.completedLessons} of {enrollment.totalLessons} lessons
                      </span>
                      <span>{enrollment.percentage}%</span>
                    </div>
                    <Progress value={enrollment.percentage} className="h-2" />
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${enrollment.Course.slug}/learn`}>
                      {enrollment.percentage === 0
                        ? "Start Learning"
                        : enrollment.percentage === 100
                          ? "Review Course"
                          : "Continue Learning"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
