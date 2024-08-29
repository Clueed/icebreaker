import type { skipToken } from "@tanstack/react-query";
import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";

import { toast } from "@icebreaker/ui/toast";

import { api } from "~/trpc/react";

export const usePhoneCallBySessionIdQuery = (
  input: AppRouterInputs["phoneCall"]["bySessionId"] | typeof skipToken,
) => {
  return api.phoneCall.bySessionId.useQuery(input);
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
                updatedAt: new Date().toISOString(),
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
    onSettled(_err, _variables, ctx) {
      void utils.phoneCall.bySessionId.invalidate({ sessionId: ctx.sessionId });
      void utils.phoneCall.history.invalidate({});
    },
  });
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

      toast.success(`Call created`);
      void utils.phoneCall.history.invalidate();
      void utils.phoneCall.bySessionId.invalidate({
        sessionId: variables.sessionId,
      });
    },
  });
};
