import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";
import { useCallback } from "react";
import { skipToken, useIsFetching } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { toast } from "@icebreaker/ui/toast";

import { api } from "~/trpc/react";

export const useSelectedGuessId = (
  input: AppRouterInputs["org"]["byId"] | typeof skipToken,
) => {
  return api.org.byId.useQuery(input, {
    select: (org) => org.selectedGuessId,
    placeholderData: (prev) => prev,
  });
};

export const useSelectedGuessQuery = (
  input: AppRouterInputs["org"]["byId"],
) => {
  const { data: selectedGuessId } = useSelectedGuessId(input);
  return api.guess.byId.useQuery(
    selectedGuessId ? { id: selectedGuessId } : skipToken,
    {
      placeholderData: (prev) => prev,
    },
  );
};

export const useSelectedGuessIsPending = (props: { orgId: string }) => {
  const orgIsPending =
    useIsFetching({
      queryKey: getQueryKey(api.org.byId, { id: props.orgId }),
      fetchStatus: "fetching",
    }) > 0;

  const { data: selectedGuessId } = useSelectedGuessId({ id: props.orgId });

  const guessByIdIsPending =
    useIsFetching({
      queryKey: getQueryKey(
        api.guess.byId,
        selectedGuessId ? { id: selectedGuessId } : undefined,
      ),
      fetchStatus: "fetching",
    }) > 0;

  return orgIsPending || guessByIdIsPending;
};

export const useSetSelectedGuessId = () => {
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
      void utils.org.byId.invalidate({ id: ctx.id });
    },
  });

  const { mutate, mutateAsync, ...rest } = mutation;

  return {
    ...rest,
    mutate: useCallback(
      (
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
      [mutate],
    ),
    mutateAsync: useCallback(
      async (
        input: {
          orgId: string;
          data: {
            selectedGuessId: string;
          };
        },
        ...args: RemoveFirst<Parameters<typeof mutateAsync>>
      ) => {
        return await mutateAsync(
          { id: input.orgId, data: input.data },
          ...args,
        );
      },
      [mutateAsync],
    ),
  };
};

type RemoveFirst<T extends unknown[]> = T extends [unknown, ...infer Rest]
  ? Rest
  : never;
