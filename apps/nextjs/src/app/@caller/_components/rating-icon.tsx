import type { LucideProps } from "@acme/ui/icons";
import { PhoneCallRating } from "@acme/db/schema";
import {
  MailboxIcon,
  PhoneMissedIcon,
  TargetIcon,
  UserIcon,
} from "@acme/ui/icons";

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
