import { SectionCards } from "@/components/section-cards";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";

export default async function AdminIndexPage() {
  await requireAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    currentRevenue,
    previousRevenue,
    currentUsers,
    previousUsers,
    currentEnrollments,
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
        User: { select: { name: true, email: true } },
        Course: { select: { title: true } },
      },
    }),
  ]);

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revCurrent = currentRevenue._sum.amount ?? 0;
  const revPrevious = previousRevenue._sum.amount ?? 0;

  return (
    <>
      <SectionCards
        revenue={{ amount: revCurrent, change: calcChange(revCurrent, revPrevious) }}
        users={{ count: currentUsers, change: calcChange(currentUsers, previousUsers) }}
        enrollments={{ count: currentEnrollments, change: calcChange(currentEnrollments, previousEnrollments) }}
        courses={{ count: totalCourses }}
      />
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Enrollments</h3>
          {recentEnrollments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No enrollments yet</p>
          ) : (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{enrollment.User.name}</p>
                    <p className="text-xs text-muted-foreground">{enrollment.User.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{enrollment.Course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(enrollment.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
