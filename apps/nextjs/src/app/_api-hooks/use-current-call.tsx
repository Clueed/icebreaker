import { useIsMutating } from "@tanstack/react-query";
import { getMutationKey } from "@trpc/react-query";

import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export const useCurrentCallQuery = () => {
  return api.phoneCall.current.useQuery(undefined, {
    staleTime: 0,
    select: (data) => (data === 0 ? null : data),
  });
};

export const useCurrentCallUpdateMutation = () => {
  const utils = api.useUtils();
  return api.phoneCall.updateCurrent.useMutation({
    async onMutate(payload) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.phoneCall.current.cancel();
      // Get the data from the queryCache
      const prevData = utils.phoneCall.current.getData();
      // Optimistically update the data with our new userSettings
      utils.phoneCall.current.setData(undefined, (old) =>
        old
          ? {
              ...old,
              ...payload.data,
              updatedAt: new Date().toISOString(),
            }
          : undefined,
      );
      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, payload, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.phoneCall.current.setData(
        undefined,
        ctx ? ctx.prevData : undefined,
      );
      toast.error(`Failed to update current call: ${err.message}`);
    },
    onSettled(err, variables, ctx, res) {
      // Sync with server once mutation has settled
      utils.phoneCall.current.invalidate();
    },
    onSuccess(data, variables, ctx) {
      // Sync with server once mutation has settled
      if (data) {
        utils.guess.byId.invalidate({ id: data.guessId });
      }
    },
  });
};

export const useCurrentCallCreateMutation = () => {
  const mutationCount = useIsMutating({
    mutationKey: getMutationKey(api.phoneCall.createCurrent),
    exact: true,
    status: "pending",
  });

  const utils = api.useUtils();
  return api.phoneCall.createCurrent.useMutation({
    async onMutate(payload) {
      if (mutationCount > 0) {
        return Promise.reject();
      }
    },
    onSuccess(data, variables, ctx) {
      // Sync with server once mutation has settled
      utils.phoneCall.current.invalidate();
      if (data) {
        utils.guess.byId.invalidate({ id: variables.guessId });
      }
    },
    onError(error, variables, context) {
      toast.error(`Failed to create current call: ${error.message}`);
    },
  });
};
