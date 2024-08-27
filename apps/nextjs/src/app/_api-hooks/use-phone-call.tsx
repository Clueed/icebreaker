import type { skipToken } from "@tanstack/react-query";
import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";

import { toast } from "@icebreaker/ui/toast";

import { api } from "~/trpc/react";

export const usePhoneCallByIdQuery = (
  input: AppRouterInputs["phoneCall"]["byId"] | typeof skipToken,
) => {
  return api.phoneCall.byId.useQuery(input);
};

export const usePhoneCallBySessionIdQuery = (
  input: AppRouterInputs["phoneCall"]["bySessionId"] | typeof skipToken,
) => {
  return api.phoneCall.bySessionId.useQuery(input);
};

export const usePhoneCallUpdateMutation = () => {
  const utils = api.useUtils();
  return api.phoneCall.update.useMutation({
    async onMutate(payload) {
      // byId
      await utils.phoneCall.byId.cancel();
      const prevByIdData = utils.phoneCall.byId.getData();
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

      // all

      await utils.phoneCall.all.cancel();
      const prevAllData = utils.phoneCall.all.getInfiniteData({});
      utils.phoneCall.all.setInfiniteData({}, (old) =>
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

      // guess

      return { prevByIdData, prevAllData };
    },
    onError(err, payload, ctx) {
      utils.phoneCall.bySessionId.setData(
        { sessionId: payload.sessionId },
        ctx?.prevByIdData,
      );
      utils.phoneCall.all.setInfiniteData({}, ctx?.prevAllData);
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
      void utils.phoneCall.all.invalidate({});
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
      void utils.phoneCall.all.invalidate({});
      void utils.phoneCall.bySessionId.invalidate({
        sessionId: variables.sessionId,
      });
    },
  });
};
