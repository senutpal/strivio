"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitReviewAction } from "../actions";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { name: string; image: string | null };
}

interface ReviewSectionProps {
  courseId: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  isEnrolled: boolean;
  userReview?: Review | null;
}

export function ReviewSection({
  courseId,
  reviews,
  averageRating,
  reviewCount,
  isEnrolled,
  userReview,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(userReview?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(userReview?.comment ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    startTransition(async () => {
      const result = await submitReviewAction(courseId, rating, comment);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <IconStarFilled
                  key={star}
                  className={`size-4 ${star <= Math.round(averageRating) ? "text-yellow-500" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        )}
      </div>

      {isEnrolled && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="font-medium text-sm">
              {userReview ? "Update your review" : "Write a review"}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  {star <= (hoveredRating || rating) ? (
                    <IconStarFilled className="size-6 text-yellow-500" />
                  ) : (
                    <IconStar className="size-6 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={isPending} size="sm">
              {isPending ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={review.user.image || ""} />
                <AvatarFallback>
                  {review.user.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.user.name}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconStarFilled
                        key={star}
                        className={`size-3 ${star <= review.rating ? "text-yellow-500" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
