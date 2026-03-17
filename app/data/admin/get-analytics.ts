import { prisma } from "@/lib/db";

export async function getAdminAnalytics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    previousRevenue,
    totalUsers,
    previousUsers,
    totalEnrollments,
    previousEnrollments,
    totalCourses,
    recentEnrollments,
  ] = await Promise.all([
    prisma.enrollment.aggregate({
      where: { status: "Active", createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.enrollment.aggregate({
      where: { status: "Active", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.enrollment.count({ where: { status: "Active", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.enrollment.count({ where: { status: "Active", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.course.count(),
    prisma.enrollment.findMany({
      where: { status: "Active" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        createdAt: true,
        User: {
          select: { name: true, email: true },
        },
        Course: {
          select: { title: true },
        },
      },
    }),
  ]);

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const currentRevenue = totalRevenue._sum.amount ?? 0;
  const prevRevenue = previousRevenue._sum.amount ?? 0;

  return {
    revenue: {
      amount: currentRevenue,
      change: calcChange(currentRevenue, prevRevenue),
    },
    users: {
      count: totalUsers,
      change: calcChange(totalUsers, previousUsers),
    },
    enrollments: {
      count: totalEnrollments,
      change: calcChange(totalEnrollments, previousEnrollments),
    },
    courses: {
      count: totalCourses,
    },
    recentEnrollments,
  };
}
