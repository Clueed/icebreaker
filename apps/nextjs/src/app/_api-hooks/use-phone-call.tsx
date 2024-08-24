import type { skipToken } from "@tanstack/react-query";
import type { AppRouterInputs } from "node_modules/@acme/api/dist/root";

import { toast } from "@acme/ui/toast";

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
      const prevAllData = utils.phoneCall.all.getInfiniteData({
        active: false,
      });
      utils.phoneCall.all.setInfiniteData({ active: false }, (old) =>
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

      return { prevByIdData, prevAllData };
    },
    onError(err, payload, ctx) {
      utils.phoneCall.bySessionId.setData(
        { sessionId: payload.sessionId },
        ctx?.prevByIdData,
      );
      utils.phoneCall.all.setInfiniteData(
        {
          active: false,
        },
        ctx?.prevAllData,
      );
      toast.error(`Failed to update call: ${err.message}`);
    },
    onSettled(err, variables, ctx, res) {
      //   utils.phoneCall.bySessionId.invalidate({ sessionId: ctx.id });
      utils.phoneCall.bySessionId.invalidate({ sessionId: ctx.sessionId });
      utils.phoneCall.all.invalidate({ active: false });
    },
  });
};

export const usePhoneCallCreateMutation = () => {
  const utils = api.useUtils();
  return api.phoneCall.create.useMutation({
    onError(error, variables, context) {
      toast.error(`Failed to create call: ${error.message}`);
    },
    onSettled(data, error, variables) {
      toast.success(`Call created`);
      utils.phoneCall.all.invalidate({ active: false });
      utils.phoneCall.bySessionId.invalidate({
        sessionId: variables.sessionId,
      });
      utils.guess.all.invalidate();
      if (data) {
        utils.guess.byId.invalidate({ id: data.guessId });
      }
    },
  });
};
