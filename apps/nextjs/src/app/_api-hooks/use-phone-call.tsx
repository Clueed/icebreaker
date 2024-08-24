import type { skipToken } from "@tanstack/react-query";
import type { AppRouterInputs } from "node_modules/@acme/api/dist/root";

import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export const usePhoneCallByIdQuery = (
  input: AppRouterInputs["phoneCall"]["byId"] | typeof skipToken,
) => {
  return api.phoneCall.byId.useQuery(input);
};

export const usePhoneCallUpdateMutation = () => {
  const utils = api.useUtils();
  return api.phoneCall.update.useMutation({
    async onMutate(payload) {
      // byId
      await utils.phoneCall.byId.cancel();
      const prevByIdData = utils.phoneCall.byId.getData();
      utils.phoneCall.byId.setData({ id: payload.id }, (old) =>
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
                  item.id === payload.id
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
      utils.phoneCall.byId.setData({ id: payload.id }, ctx?.prevByIdData);
      utils.phoneCall.all.setInfiniteData(
        {
          active: false,
        },
        ctx?.prevAllData,
      );
      toast.error(`Failed to update call: ${err.message}`);
    },
    onSettled(err, variables, ctx, res) {
      utils.phoneCall.byId.invalidate({ id: ctx.id });
      utils.phoneCall.all.invalidate({ active: false });
    },
  });
};
