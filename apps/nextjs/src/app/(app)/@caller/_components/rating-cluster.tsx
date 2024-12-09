import { useCallback } from "react";

import type {
  PhoneCallRating,
  PhoneCallRatingNullable,
} from "@icebreaker/validators/phone-call-rating";
import { ToggleGroup, ToggleGroupItem } from "@icebreaker/ui/toggle-group";
import {
  phoneCallRatingList,
  phoneCallRatingSchema,
} from "@icebreaker/validators/phone-call-rating";

import { usePhoneCallUpdateMutation } from "~/app/_api-hooks/use-phone-call";
import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";

export const CallRatingCluster = (props: {
  rating: PhoneCallRatingNullable;
  sessionId: string | null;
  disabled: boolean;
}) => {
  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();
  const handleUpdatePhoneCall = useCallback(
    (newRating: PhoneCallRating) => {
      if (!props.sessionId) {
        throw new Error("cant update call: currentSessionId not found");
      }

      updatePhoneCall({
        sessionId: props.sessionId,
        data: {
          rating: newRating,
        },
      });
    },
    [props.sessionId, updatePhoneCall],
  );

  return (
    <CallRatingUi
      rating={props.rating}
      setRating={handleUpdatePhoneCall}
      disabled={props.disabled}
    />
  );
};

const CallRatingUi = (props: {
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

  return (
    <ToggleGroup
      type="single"
      value={props.rating ?? undefined}
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
  );
};
