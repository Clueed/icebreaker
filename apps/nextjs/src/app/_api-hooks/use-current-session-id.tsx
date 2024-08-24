import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export const useCurrentSessionIdQuery = () => {
  return api.currentPhoneCall.getCurrent.useQuery(undefined, {
    staleTime: 0,
    // refetchInterval: 500,
  });
};

export const useCurrentSessionIdMutation = () => {
  const utils = api.useUtils();
  return api.currentPhoneCall.setCurrent.useMutation({
    async onMutate(payload) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.currentPhoneCall.getCurrent.cancel();
      // Get the data from the queryCache
      const prevData = utils.currentPhoneCall.getCurrent.getData();
      // Optimistically update the data with our new userSettings
      utils.currentPhoneCall.getCurrent.setData(undefined, {
        currentSessionId: payload.sessionId,
      });

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, payload, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.currentPhoneCall.getCurrent.setData(
        undefined,
        ctx ? ctx.prevData : undefined,
      );
      toast.error(`Failed to update current call: ${err.message}`);
    },
    onSettled(data, error, variables, context) {
      utils.currentPhoneCall.getCurrent.invalidate();
    },
  });
};
