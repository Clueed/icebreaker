import type { PhoneCallRating } from "@icebreaker/db/schema";
import {
  phoneCallRatingList,
  phoneCallRatingSchema,
} from "@icebreaker/db/schema";
import { ToggleGroup, ToggleGroupItem } from "@icebreaker/ui/toggle-group";

import { RatingIcon } from "~/app/@caller/_components/rating-icon";

export const CurrentCallRatingCluster = (props: {
  rating?: PhoneCallRating;
  setRating: (newRating: PhoneCallRating) => void;
  disabled: boolean;
}) => {
  const handleOnValueChange = (value: string) => {
    const newValue = value === "null" ? null : value;
    const parsedRating = phoneCallRatingSchema.parse(newValue);

    props.setRating(parsedRating);
  };

  return (
    <div className="flex gap-3">
      <ToggleGroup
        type="single"
        value={props.rating ?? "null"}
        onValueChange={handleOnValueChange}
        className="w-full"
        size={"lg"}
      >
        {ALL_RATINGS.map((rating) => (
          <ToggleGroupItem
            value={rating ?? "null"}
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

const ALL_RATINGS = [null, ...phoneCallRatingList];
