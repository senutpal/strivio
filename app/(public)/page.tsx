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
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface FeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: FeatureProps[] = [
  {
    title: "Curated Courses",
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
        onError: () => {
          toast.error("Failed to Sign Out");
        },
      },
    });
  }

  return (
    <>
      <section className="relative py-16">
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

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-6 mb-10">
        {features.map((feature, index) => (
          <div key={index} className="relative h-full min-h-[14rem]">
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Card className="relative h-full border-[0.75px] bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] bg-gradient-to-t from-primary/5 to-card">
                <CardHeader>
                  <div className="mb-4 w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
