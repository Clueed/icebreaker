import type { PhoneCallRating } from "@icebreaker/validators/phone-call-rating";
import { cn } from "@icebreaker/ui";
import { ToggleGroup, ToggleGroupItem } from "@icebreaker/ui/toggle-group";
import {
  phoneCallRatingList2,
  phoneCallRatingSchema,
} from "@icebreaker/validators/phone-call-rating";

import { RatingIcon } from "~/app/@caller/_components/rating-icon";

export const CallRatingCluster = (props: {
  rating: PhoneCallRating;
  setRating: (newRating: NonNullable<PhoneCallRating>) => void;
  disabled: boolean;
}) => {
  const handleOnValueChange = (value: string) => {
    const newValue = value === "null" ? null : value;
    const parsedRating = phoneCallRatingSchema.parse(newValue);

    props.setRating(parsedRating);
  };

  if (props.rating === null) {
    return null;
  }

  return (
    <div className={cn("flex gap-3")}>
      <ToggleGroup
        type="single"
        value={props.rating}
        onValueChange={handleOnValueChange}
        className="w-full"
        size={"lg"}
      >
        {phoneCallRatingList2.map((rating) => (
          <ToggleGroupItem
            value={rating}
            key={rating}
            disabled={props.disabled}
            className="w-full"
          >
            <RatingIcon className="size-5" rating={rating} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
