"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  BookOpen,
  Users,
  ChartBar,
  MessageSquare,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: FeatureProps[] = [
  {
    title: "Comprehensive Courses",
    description:
      "Access a wide range of carefully curated courses designed by industry experts to help you stay ahead.",
    icon: BookOpen,
  },
  {
    title: "Interactive Learning",
    description:
      "Engage with dynamic lessons, quizzes, and hands-on projects that make learning fun and effective.",
    icon: MessageSquare,
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with detailed progress tracking and personalized insights.",
    icon: ChartBar,
  },
  {
    title: "Community Support",
    description:
      "Connect with peers, mentors, and experts in our vibrant learning community for guidance and motivation.",
    icon: Users,
  },
];

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("Signed out successfully!");
        },
      },
    });
  }

  return (
    <>
      <section className="relative py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="outline">The Future of Online Education</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Elevate Your Learning Experience
          </h1>
          <p className="md:max-w-[700px] max-w-[360px] text-muted-foreground md:text-xl">
            Discover a new way to learn with our modern, interactive learning
            management system. Access high-quality courses anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              className={buttonVariants({
                size: "lg",
              })}
              href="/courses"
            >
              Explore Courses
            </Link>
            {!session ? (
              <Link
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                })}
                href="/login"
              >
                Start Learning
              </Link>
            ) : (
              <button
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                })}
                onClick={signOut}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-4">
                <feature.icon />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
