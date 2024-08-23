import type { SessionState } from "sip.js";
import { useEffect } from "react";
import { useSIPProvider } from "react-sipjs";

import { toast } from "@acme/ui/toast";

import {
  useCurrentCallQuery,
  useCurrentCallUpdateMutation,
} from "~/app/_api-hooks/use-current-call";

export function useSyncCallState() {
  const { data: phoneCall } = useCurrentCallQuery();

  const { mutate: updatePhoneCall } = useCurrentCallUpdateMutation();
  const { sessions } = useSIPProvider();

  const { sessionId, id } = phoneCall || {};

  useEffect(() => {
    if (!sessionId) {
      console.log(`[sync - ${id}] \n No sessionId available, skipping update.`);
      return;
    }

    const session = sessionId ? sessions[sessionId] : undefined;

    console.log(`[sync - ${id}] \n Retrieved session:`, session);

    if (!session) {
      console.log(
        `[sync - ${id}] \n (no session) changing current call state to:`,
        `Terminated`,
      );
      updatePhoneCall(
        {
          data: {
            state: `Terminated`,
          },
        },
        {
          onError: (err) => {
            console.error(
              `[sync - ${id}] \n Error updating call state:`,
              err.message,
            );
            toast.error(err.message);
          },
        },
      );
      return;
    }

    const listener = (newSessionState: SessionState) => {
      console.log(
        `[sync - ${id}] \n changing current call state to:`,
        newSessionState,
      );
      updatePhoneCall(
        {
          data: {
            state: newSessionState,
          },
        },
        {
          onError: (err) => {
            console.error(
              `[sync - ${id}] \n Error updating call state:`,
              err.message,
            );
            toast.error(err.message);
          },
        },
      );
    };

    // .addListener runs only on change
    console.log(`[sync - ${id}] \n Updating to current state`);
    listener(session.state);

    console.log(`[sync - ${id}] \n Adding listener to session.stateChange`);
    session.stateChange.addListener(listener);

    return () => {
      console.log(
        `[sync - ${id}] \n Removing listener from session.stateChange`,
      );
      session.stateChange.removeListener(listener);
    };
  }, [sessionId, id, updatePhoneCall]);
}
