import React from "react";

import { api } from "~/trpc/react";

export function useOptimisticOrgMutation() {
  const utils = api.useUtils();
  const { mutateAsync: update } = api.org.update.useMutation({
    async onMutate(payload) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.org.byId.cancel({ id: payload.id });
      // Get the data from the queryCache
      const prevData = utils.org.byId.getData({ id: payload.id });
      // Optimistically update the data with our new org
      utils.org.byId.setData({ id: payload.id }, (old) =>
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
      utils.org.byId.setData(
        { id: payload.id },
        ctx ? ctx.prevData : undefined,
      );
    },
    onSettled(err, variables, ctx) {
      // Sync with server once mutation has settled
      utils.org.byId.invalidate({ id: ctx.id });
    },
  });
  return {
    updateOrg: update,
  };
}
