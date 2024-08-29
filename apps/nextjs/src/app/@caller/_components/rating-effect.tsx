import type { PhoneCallRating } from "@icebreaker/db/schema";
import { cn } from "@icebreaker/ui";

export const RatingEffect = ({
  rating,
  answered,
  children,
}: {
  rating: PhoneCallRating;
  answered?: boolean;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "relative",
        rating === null && answered && "text-muted-foreground",
        !answered && "text-muted-foreground opacity-50",
      )}
    >
      {" "}
      <div
        className={cn(
          "absolute inset-0 -z-50",
          "blur-lg",
          rating === "voicemail" && "bg-blue-300",
          rating === "person" && "bg-sky-500",
          rating === "jackpot" && "bg-cyan-600",
        )}
      />{" "}
      {children}
    </div>
  );
};
