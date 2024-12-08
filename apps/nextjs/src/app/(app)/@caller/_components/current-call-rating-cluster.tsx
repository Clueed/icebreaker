import type {
  PhoneCallRating,
  PhoneCallRatingNullable,
} from "@icebreaker/validators/phone-call-rating";
import { cn } from "@icebreaker/ui";
import { ToggleGroup, ToggleGroupItem } from "@icebreaker/ui/toggle-group";
import {
  phoneCallRatingList,
  phoneCallRatingSchema,
} from "@icebreaker/validators/phone-call-rating";

import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";

export const CallRatingCluster = (props: {
  rating: PhoneCallRatingNullable;
  setRating: (newRating: PhoneCallRating) => void;
  disabled: boolean;
}) => {
  const handleOnValueChange = (value: string) => {
    if (value === "") {
      return;
    }
    const parsedRating = phoneCallRatingSchema.parse(value);
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
        {phoneCallRatingList.map((rating) => (
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
