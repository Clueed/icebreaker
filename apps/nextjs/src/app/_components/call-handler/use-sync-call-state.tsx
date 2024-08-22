import type { AppRouterInputs } from "node_modules/@acme/api/dist/root";
import type { SessionState } from "sip.js";
import { useCallback, useEffect } from "react";
import { useSIPProvider } from "react-sipjs";

import { toast } from "@acme/ui/toast";

import {
  useCurrentCallQuery,
  useCurrentCallUpdateMutation,
} from "~/app/_api-hooks/use-current-call";

export function useSyncCallState() {
  const { data: phoneCall } = useCurrentCallQuery();
  const { sessionId, id, state } = phoneCall ?? {};

  const { mutate: updatePhoneCall } = useCurrentCallUpdateMutation();
  const handleUpdatePhoneCall = useCallback(
    (inputs: AppRouterInputs["phoneCall"]["updateCurrent"]) => {
      console.log(
        `[sync - ${id}] \n changing current call state to: ${inputs.data.state}`,
      );
      updatePhoneCall(inputs, {
        onError: (err) => {
          console.error(
            `[sync - ${id}] \n Error updating current call state:`,
            err.message,
          );
          toast.error(err.message);
        },
      });
    },
    [id, updatePhoneCall],
  );

  const { sessions, sessionTimer } = useSIPProvider();

  useEffect(() => {
    if (!sessionId) {
      console.log(`[sync - ${id}] \n No sessionId available, skipping update.`);
      return;
    }

    const session = sessionId ? sessions[sessionId] : undefined;
    console.log(`[sync - ${id}] \n Retrieved session:`, session);
    const timer = sessionId ? sessionTimer[sessionId] : undefined;
    console.log(`[sync - ${id}] \n Retrieved timer:`, timer);

    if (!session) {
      console.log(`[sync - ${id}] \n no session with id: ${sessionId}`);

      if (state !== `Terminated`) {
        console.log(`[sync - ${id}] \n termining call since no session`);
        handleUpdatePhoneCall({
          data: {
            state: `Terminated`,
            createdAt: timer?.createdAt.toISOString(),
            answeredAt: timer?.answeredAt?.toISOString(),
            hangupAt: timer?.hangupAt?.toISOString(),
            receivedAt: timer?.receivedAt?.toISOString(),
          },
        });
      }

      return;
    }

    if (
      state !== session.state ||
      (timer && timer.answeredAt?.toISOString() === phoneCall?.answeredAt) ||
      (timer && timer.hangupAt?.toISOString() === phoneCall?.hangupAt) ||
      (timer && timer.receivedAt?.toISOString() === phoneCall?.receivedAt) ||
      (timer && timer.createdAt?.toISOString() === phoneCall?.createdAt)
    ) {
      console.log(
        `[sync - ${id}] \n listener received new state: ${session.state}`,
      );
      handleUpdatePhoneCall({
        data: {
          state: session.state,
          createdAt: timer?.createdAt.toISOString(),
          answeredAt: timer?.answeredAt?.toISOString(),
          hangupAt: timer?.hangupAt?.toISOString(),
          receivedAt: timer?.receivedAt?.toISOString(),
        },
      });
    }
  }, [
    sessionId,
    id,
    handleUpdatePhoneCall,
    state,
    sessions,
    sessionTimer,
    phoneCall?.answeredAt,
    phoneCall?.hangupAt,
    phoneCall?.receivedAt,
    phoneCall?.createdAt,
  ]);
}
