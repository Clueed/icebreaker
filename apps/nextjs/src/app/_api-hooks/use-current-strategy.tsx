import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";

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
    onSettled(err, variables, ctx) {
      // Sync with server once mutation has settled
      void utils.org.extensionStrategyById.invalidate({ id: ctx.id });
    },
    onSuccess(data, variables) {
      // Sync with server once mutation has settled
      void utils.org.extensionStrategyById.invalidate({ id: variables.id });
    },
  });
};
