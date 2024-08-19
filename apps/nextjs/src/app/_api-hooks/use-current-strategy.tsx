import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "node_modules/@acme/api/dist/root";
import { useIsMutating } from "@tanstack/react-query";
import { getMutationKey } from "@trpc/react-query";

import { api } from "~/trpc/react";

export const useCurrentStrategyQuery = (
  input: AppRouterInputs["org"]["extensionStrategyById"],
) => {
  return api.org.extensionStrategyById.useQuery(input);
};

export const useCurrentStrategySetMutation = () => {
  const utils = api.useUtils();
  return api.org.setExtensionStrategy.useMutation({
    async onMutate(payload) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.org.extensionStrategyById.cancel();
      // Get the data from the queryCache
      const prevData = utils.org.extensionStrategyById.getData();
      // Optimistically update the data with our new userSettings

      utils.org.extensionStrategyById.setData({ id: payload.id }, (old) =>
        payload.data ? payload.data : old,
      );
      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, payload, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.org.extensionStrategyById.setData(
        { id: payload.id },
        ctx ? ctx.prevData : undefined,
      );
    },
    onSettled(err, variables, ctx, res) {
      // Sync with server once mutation has settled
      utils.org.extensionStrategyById.invalidate();
    },
    onSuccess(data, variables, ctx) {
      // Sync with server once mutation has settled
      utils.org.extensionStrategyById.invalidate({ id: variables.id });
    },
  });
};
