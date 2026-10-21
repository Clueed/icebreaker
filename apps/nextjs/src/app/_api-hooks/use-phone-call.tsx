import type { skipToken } from "@tanstack/react-query";
import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";
import { useCallback } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { getMutationKey } from "@trpc/react-query";

import { toast } from "@icebreaker/ui/toast";

import { api } from "~/trpc/react";

export const usePhoneCallBySessionIdQuery = (
  input: AppRouterInputs["phoneCall"]["bySessionId"] | typeof skipToken,
) => {
  return api.phoneCall.bySessionId.useQuery(input, {
    select: (data) => data ?? undefined,
  });
};

export const usePhoneCallUpdateMutation = () => {
  const utils = api.useUtils();
  return api.phoneCall.update.useMutation({
    async onMutate(payload) {
      // bySessionId
      await utils.phoneCall.bySessionId.cancel();
      const prevBySessionId = utils.phoneCall.bySessionId.getData();
      utils.phoneCall.bySessionId.setData(
        { sessionId: payload.sessionId },
        (old) =>
          old
            ? {
                ...old,
                ...payload.data,
              }
            : undefined,
      );

      // history

      await utils.phoneCall.history.cancel();
      const prevHistory = utils.phoneCall.history.getInfiniteData({});
      utils.phoneCall.history.setInfiniteData({}, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((item) =>
                  item.sessionId === payload.sessionId
                    ? {
                        ...item,
                        ...payload.data,
                        updatedAt: new Date().toISOString(),
                      }
                    : item,
                ),
              })),
            }
          : undefined,
      );

      return { prevBySessionId, prevHistory };
    },
    onError(err, payload, ctx) {
      utils.phoneCall.bySessionId.setData(
        { sessionId: payload.sessionId },
        ctx?.prevBySessionId,
      );
      utils.phoneCall.history.setInfiniteData({}, ctx?.prevHistory);
      toast.error(`Failed to update call: ${err.message}`);
    },
    onSuccess(data) {
      void utils.guess.byId.cancel({ id: data.guessId });
      utils.guess.byId.setData({ id: data.guessId }, (old) =>
        old
          ? {
              ...old,
              phoneCallRating: [...old.phoneCallRating, data.rating].filter(
                (rating) => rating !== null,
              ),
              updatedAt: new Date().toISOString(),
            }
          : undefined,
      );
    },
    onSettled(_data, _err, variables) {
      void utils.phoneCall.bySessionId.invalidate({
        sessionId: variables.sessionId,
      });
      void utils.phoneCall.history.invalidate({});
    },
  });
};

export const useUpdateCallIsPending = () => {
  return (
    useIsMutating({
      mutationKey: getMutationKey(api.phoneCall.update),
      status: "pending",
    }) > 0
  );
};

export const usePhoneCallCreateMutation = () => {
  const utils = api.useUtils();
  return api.phoneCall.create.useMutation({
    onError(error) {
      toast.error(`Failed to create call: ${error.message}`);
    },
    onSettled(data, error, variables) {
      if (data) {
        utils.guess.byId.setData({ id: data.guessId }, (old) =>
          old
            ? {
                ...old,
                phoneCallRating: [...old.phoneCallRating, data.rating].filter(
                  (rating) => rating !== null,
                ),
                phoneCallCount: old.phoneCallCount + 1,
                guessId: data.guessId,
                updatedAt: new Date().toISOString(),
              }
            : undefined,
        );
      }

      toast.success(`Call created`, {
        // description: variables.phoneNumber,
      });
      void utils.phoneCall.history.invalidate();
      void utils.guess.history.invalidate({ orgId: variables.orgId });
      void utils.phoneCall.bySessionId.invalidate({
        sessionId: variables.sessionId,
      });
    },
  });
};

/**
 * Refreshes everything that shows past calls once a call ends, no matter
 * whether it was hung up manually, automatically or by the other side.
 */
export const usePhoneCallEndedHandler = () => {
  const utils = api.useUtils();
  return useCallback(
    ({ sessionId }: { sessionId: string }) => {
      void utils.phoneCall.bySessionId.invalidate({ sessionId });
      void utils.phoneCall.history.invalidate();
      void utils.guess.history.invalidate();
      void utils.guess.byId.invalidate();
    },
    [utils],
  );
};

export const useCreateCallIsPending = () => {
  return (
    useIsMutating({
      mutationKey: getMutationKey(api.phoneCall.create),
      status: "pending",
    }) > 0
  );
};
