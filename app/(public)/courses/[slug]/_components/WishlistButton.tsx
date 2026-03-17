"use client";

import { Button } from "@/components/ui/button";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { toggleWishlistAction } from "../actions";

interface WishlistButtonProps {
  courseId: string;
  isInWishlist: boolean;
  isLoggedIn: boolean;
}

export function WishlistButton({
  courseId,
  isInWishlist,
  isLoggedIn,
}: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const result = await toggleWishlistAction(courseId);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isInWishlist ? (
        <IconHeartFilled className="size-4 mr-1 text-red-500" />
      ) : (
        <IconHeart className="size-4 mr-1" />
      )}
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
