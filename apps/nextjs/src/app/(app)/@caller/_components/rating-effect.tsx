import { useAutoAnimate } from "@formkit/auto-animate/react";

import type { PhoneCallRatingNullable } from "@icebreaker/validators/phone-call-rating";
import { cn } from "@icebreaker/ui";

export const RatingEffect = ({
  rating,
  children,
}: {
  rating: PhoneCallRatingNullable;
  children: React.ReactNode;
}) => {
  const [animateRef] = useAutoAnimate();
  return (
    <div className={cn("relative")} ref={animateRef}>
      <div
        className={cn(
          "absolute inset-0 -z-50",
          "blur-lg",
          rating === null && "text-muted-foreground",
          rating === "voicemail" && "bg-blue-300 text-blue-100",
          rating === "person" && "bg-sky-500 text-sky-100",
          rating === "jackpot" && "bg-cyan-600 text-cyan-100",
        )}
      />
      {children}
    </div>
  );
};
