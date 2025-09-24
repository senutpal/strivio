"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
  const router = useRouter();

  const handleSignOut = async function signOut() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.replace("/");
            toast.success("Signed out successfully!");
          },
          onError: () => {
            toast.error("Failed to Sign Out");
          },
        },
      });
    } catch {
      toast.error("Failed to Sign Out");
    }
  };

  return handleSignOut;
}
