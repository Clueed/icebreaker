import React from "react";

import { api } from "~/trpc/react";

export function OptimisticPhoneCallUpdate() {
  const utils = api.useUtils();
  const {} = api.phoneCall.create.useMutation({
    async onMutate(newPhoneCall) {
      await utils.phoneCall.byId.cancel();

      // Get the data from the queryCache
      const prevData = utils.phoneCall.byId.getData({ id: newPhoneCall.id });

      // Optimistically update the data with our new post
      utils.post.list.setData(undefined, (old) => [...old, newPhoneCall]);

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.post.list.setData(undefined, ctx.prevData);
    },
    onSettled() {
      // Sync with server once mutation has settled
      utils.post.list.invalidate();
    },
  });
  return {};
}
