import type { PhoneCallRating } from "@icebreaker/validators/phone-call-rating";
import { cn } from "@icebreaker/ui";

export const RatingEffect = ({
  rating,
  children,
}: {
  rating: PhoneCallRating;
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("relative", rating === null && "text-muted-foreground")}>
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
