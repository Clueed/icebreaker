import { phoneCallRatingList, phoneCallRatingSchema } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { ToggleGroup, ToggleGroupItem } from "@acme/ui/toggle-group";

import {
  useCurrentCallQuery,
  useCurrentCallUpdateMutation,
} from "~/app/_api-hooks/use-current-call";
import { RatingIcon } from "~/app/@caller/_components/rating-icon";

export const CurrentCallRatingCluster = () => {
  const ratings = [null, ...phoneCallRatingList];

  const { mutate: updateCurrentPhoneCall } = useCurrentCallUpdateMutation();

  const { data: currentCall, isSuccess } = useCurrentCallQuery();

  const currentRating = currentCall?.rating;

  const handleOnValueChange = (value: string) => {
    const newValue = value === "null" ? null : value;
    const parsedRating = phoneCallRatingSchema.parse(newValue);

    updateCurrentPhoneCall({
      data: {
        rating: parsedRating,
      },
    });
  };

  return (
    <div className="flex gap-3">
      <ToggleGroup
        type="single"
        value={currentRating ?? "null"}
        onValueChange={handleOnValueChange}
        className="w-full"
        size={"lg"}
      >
        {ratings.map((rating) => (
          <ToggleGroupItem
            value={rating ?? "null"}
            key={rating}
            disabled={!isSuccess}
            className="w-full"
          >
            <RatingIcon className="size-5" rating={rating} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
