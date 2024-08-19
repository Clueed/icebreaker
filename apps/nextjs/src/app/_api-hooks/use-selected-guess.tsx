import type { AppRouterInputs } from "node_modules/@acme/api/dist/root";
import { skipToken } from "@tanstack/react-query";

import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export const useSelectedGuessQuery = (
  input: AppRouterInputs["org"]["byId"],
) => {
  const { data: selectedGuessId } = api.org.byId.useQuery(input, {
    select: (org) => org.selectedGuessId,
  });
  return api.guess.byId.useQuery(
    selectedGuessId ? { id: selectedGuessId } : skipToken,
    {
      placeholderData: (prev) => prev,
    },
  );
};

export const useSelectedGuessIdSetQuery = () => {
  const utils = api.useUtils();
  const mutation = api.org.update.useMutation({
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
      toast.error("Error setting selectedGuessId: " + err.message);
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

  const { mutate, mutateAsync, ...rest } = mutation;

  return {
    ...rest,
    mutate: async (
      input: {
        orgId: string;
        data: {
          selectedGuessId: string;
        };
      },
      ...args: RemoveFirst<Parameters<typeof mutate>>
    ) => {
      return mutate({ id: input.orgId, data: input.data }, ...args);
    },
    mutateAsync: async (
      input: {
        orgId: string;
        data: {
          selectedGuessId: string;
        };
      },
      ...args: RemoveFirst<Parameters<typeof mutateAsync>>
    ) => {
      return await mutateAsync({ id: input.orgId, data: input.data }, ...args);
    },
  };
};

type RemoveFirst<T extends unknown[]> = T extends [unknown, ...infer Rest]
  ? Rest
  : never;
