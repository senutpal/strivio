"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hello World</h1>
      <ThemeToggle />

      {session ? (
        <div className="mt-6 space-y-4">
          <p className="text-lg">
            Signed in as <strong>{session.user.name}</strong>
          </p>
          <Button onClick={signOut} variant="destructive">
            Sign out
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <Button onClick={() => router.push("/login")}>
            Sign in with GitHub
          </Button>
        </div>
      )}
    </div>
  );
}
