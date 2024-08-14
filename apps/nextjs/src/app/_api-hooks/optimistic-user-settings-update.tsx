import React from "react";

import { api } from "~/trpc/react";

export function useOptimisticUserSettingsMutation() {
  const utils = api.useUtils();
  const { mutateAsync: update } = api.userSettings.set.useMutation({
    async onMutate(payload) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.userSettings.get.cancel();
      // Get the data from the queryCache
      const prevData = utils.userSettings.get.getData();
      // Optimistically update the data with our new userSettings
      utils.userSettings.get.setData(undefined, (old) =>
        old
          ? {
              ...old,
              ...payload,
              updatedAt: new Date().toISOString(),
            }
          : undefined,
      );
      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, payload, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.userSettings.get.setData(undefined, ctx ? ctx.prevData : undefined);
    },
    onSettled(err, variables, ctx) {
      // Sync with server once mutation has settled
      utils.userSettings.get.invalidate();
    },
  });
  return {
    updateUserSettings: update,
  };
}
