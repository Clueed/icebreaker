import type { PhoneCallRating } from "@icebreaker/db/schema";
import type { LucideProps } from "@icebreaker/ui/icons";
import {
  MailboxIcon,
  PhoneMissedIcon,
  SkullIcon,
  TargetIcon,
  UserIcon,
} from "@icebreaker/ui/icons";

export const RatingIcon = ({
  rating,
  answered,
  ...props
}: { rating: PhoneCallRating; answered?: boolean } & LucideProps) => {
  switch (rating) {
    case null:
      if (answered) {
        return <PhoneMissedIcon {...props} />;
      }
      return <SkullIcon {...props} />;
    case "voicemail":
      return <MailboxIcon {...props} />;
    case "person":
      return <UserIcon {...props} />;
    case "jackpot":
      return <TargetIcon {...props} />;
  }
};
