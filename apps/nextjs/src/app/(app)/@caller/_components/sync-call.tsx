import type { Timer } from "react-sipjs";
import { useEffect } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { getMutationKey } from "@trpc/react-query";
import { DateTime } from "luxon";

import type { RouterOutputs } from "@icebreaker/api";

import { usePhoneCallUpdateMutation } from "~/app/_api-hooks/use-phone-call";
import { api } from "~/trpc/react";

const getSomethingIsDifferent = ({
  phoneCall,
  timer,
}: {
  phoneCall?: RouterOutputs["phoneCall"]["bySessionId"];
  timer?: Timer;
}) => {
  if (!timer || !phoneCall) {
    return {};
  }

  const phoneCallHungupAt = phoneCall.hangupAt
    ? DateTime.fromSQL(phoneCall.hangupAt)
    : null;
  const phoneCallAnsweredAt = phoneCall.answeredAt
    ? DateTime.fromSQL(phoneCall.answeredAt)
    : null;

  const timerAnsweredAt = timer.answeredAt
    ? DateTime.fromJSDate(timer.answeredAt)
    : null;

  const timerHungupAt = timer.hangupAt
    ? DateTime.fromJSDate(timer.hangupAt)
    : null;

  [
    phoneCallHungupAt,
    phoneCallAnsweredAt,
    timerAnsweredAt,
    timerHungupAt,
  ].forEach((date) => {
    if (date && !date.isValid) {
      console.error(`[sync] Invalid date: ${Object.keys(date)[0]}`);
      throw new Error("Invalid date");
    }
  });

  const answeredAtNotUpdated = timerAnsweredAt && !phoneCallAnsweredAt;
  const hangupAtNotUpdated = timerHungupAt && !phoneCallHungupAt;

  if (answeredAtNotUpdated || hangupAtNotUpdated) {
    return {
      timerAnsweredAt,
      timerHungupAt,
    };
  }

  const answeredAtIsNew =
    timerAnsweredAt?.toSeconds() !== phoneCallAnsweredAt?.toSeconds();

  const hangupAtIsNew =
    timerHungupAt?.toSeconds() !== phoneCallHungupAt?.toSeconds();

  if (answeredAtIsNew || hangupAtIsNew) {
    return {
      somethingIsDifferent: true,
      timerAnsweredAt,
      timerHungupAt,
    };
  }

  return {};
};

export const useSyncCall = ({
  phoneCall,
  timer,
}: {
  phoneCall?: RouterOutputs["phoneCall"]["bySessionId"];
  timer?: Timer;
}) => {
  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();

  const { timerAnsweredAt, timerHungupAt } = getSomethingIsDifferent({
    phoneCall,
    timer,
  });

  const callIsUpdating =
    useIsMutating({
      mutationKey: getMutationKey(api.phoneCall.update),
      status: "pending",
    }) > 0;

  useEffect(() => {
    if (!phoneCall) {
      return;
    }

    if (callIsUpdating) {
      console.debug("[sync] callIsUpdating");
      return;
    }

    if (!timerAnsweredAt && !timerHungupAt) {
      console.debug("[sync] nothing different");
      return;
    }

    updatePhoneCall({
      sessionId: phoneCall.sessionId,
      data: {
        hangupAt: timerHungupAt
          ? timerHungupAt.toSQL({ includeOffset: true })
          : undefined,
        answeredAt: timerAnsweredAt
          ? timerAnsweredAt.toSQL({ includeOffset: true })
          : undefined,
        rating:
          !phoneCall.rating && timerAnsweredAt ? "answered" : phoneCall.rating,
      },
    });
  }, [
    callIsUpdating,
    phoneCall,
    timerAnsweredAt,
    timerHungupAt,
    updatePhoneCall,
  ]);
};
