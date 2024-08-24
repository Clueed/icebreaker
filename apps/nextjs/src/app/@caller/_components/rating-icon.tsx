import type { PhoneCallRating } from "@icebreaker/db/schema";
import type { LucideProps } from "@icebreaker/ui/icons";
import {
  MailboxIcon,
  PhoneMissedIcon,
  TargetIcon,
  UserIcon,
} from "@icebreaker/ui/icons";

export const RatingIcon = ({
  rating,
  ...props
}: { rating: PhoneCallRating } & LucideProps) => {
  switch (rating) {
    case null:
      return <PhoneMissedIcon {...props} />;
    case "voicemail":
      return <MailboxIcon {...props} />;
    case "person":
      return <UserIcon {...props} />;
    case "jackpot":
      return <TargetIcon {...props} />;
  }
};
