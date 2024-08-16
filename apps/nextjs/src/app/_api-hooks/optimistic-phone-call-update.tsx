import React from "react";

import { api } from "~/trpc/react";

export function useOptimisticPhoneCallMutation() {
  const utils = api.useUtils();
  const { mutateAsync: create } = api.phoneCall.create.useMutation({
    async onSuccess(newPhoneCall, variables) {
      utils.phoneCall.all.invalidate();
      utils.phoneCall.byId.invalidate({ id: newPhoneCall.id });
      //   await utils.phoneCall.byId.cancel({ id: newPhoneCall.id });
      //   utils.phoneCall.byId.setData(
      //     { id: newPhoneCall.id },
      //     {
      //       id: newPhoneCall.id,
      //       createdAt: new Date(),
      //       updatedAt: new Date(),
      //       ...variables,
      //     },
      //   );
      //   return undefined;
    },
    onSettled() {
      // utils.phoneCall.byId.invalidate();
    },
  });

  const { mutateAsync: update } = api.phoneCall.update.useMutation({
    async onMutate(phoneCall) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.phoneCall.byId.cancel({ id: phoneCall.id });
      // Get the data from the queryCache
      const prevData = utils.phoneCall.byId.getData({ id: phoneCall.id });
      // Optimistically update the data with our new phoneCall
      utils.phoneCall.byId.setData({ id: phoneCall.id }, (old) =>
        old
          ? {
              ...old,
              ...phoneCall.data,
              updatedAt: new Date().toISOString(),
            }
          : undefined,
      );
      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, phoneCall, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.phoneCall.byId.setData({ id: phoneCall.id }, ctx?.prevData);
    },
    onSettled(phoneCall, variables, ctx) {
      // Sync with server once mutation has settled
      utils.phoneCall.byId.invalidate({ id: ctx.id });
      utils.phoneCall.all.invalidate();
      utils.guess.byId.invalidate({ id: phoneCall?.guessId });
      utils.guess.all.invalidate();
    },
  });
  return {
    createPhoneCall: create,
    updatePhoneCall: update,
  };
}
