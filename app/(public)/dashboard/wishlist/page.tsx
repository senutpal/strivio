import { requireUser } from "@/app/data/user/require-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { IconHeart } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default async function WishlistPage() {
  const user = await requireUser();

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
          price: true,
          duration: true,
          level: true,
          category: true,
          smallDescription: true,
        },
      },
    },
  });

  return (
    <div className="mt-5">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-muted-foreground">
          Courses you&apos;ve saved for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <IconHeart className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Browse courses and save your favorites for later
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const thumbnailUrl = `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME}.t3.storage.dev/${item.course.fileKey}`;
            return (
              <Card key={item.id} className="group py-0 gap-0">
                <Image
                  width={600}
                  height={400}
                  className="w-full rounded-t-xl aspect-video object-cover"
                  src={thumbnailUrl}
                  alt={item.course.title}
                />
                <CardContent className="p-4">
                  <Link
                    href={`/courses/${item.course.slug}`}
                    className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
                  >
                    {item.course.title}
                  </Link>
                  <p className="line-clamp-2 text-sm text-muted-foreground mt-2">
                    {item.course.smallDescription}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-semibold text-primary">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(item.course.price)}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/courses/${item.course.slug}`}>View Course</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
