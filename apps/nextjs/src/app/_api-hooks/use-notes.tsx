import type { RouterInputs } from "@icebreaker/api";

import { api } from "~/trpc/react";

export const useNotesQuery = (inputs: RouterInputs["notes"]["getByOrg"]) => {
  return api.notes.getByOrg.useQuery(inputs, {
    select: (data) => data.notes,
  });
};

export const useAddNoteMutation = () => {
  const utils = api.useUtils();
  return api.notes.add.useMutation({
    async onMutate(variables) {
      await utils.notes.getByOrg.cancel();

      const prevData = utils.notes.getByOrg.getData({ orgId: variables.orgId });

      utils.notes.getByOrg.setData(
        {
          orgId: variables.orgId,
        },
        (old) => ({ ...old, notes: [...(old?.notes ?? []), variables.note] }),
      );

      return { prevData };
    },
    onError(_err, variables, ctx) {
      utils.notes.getByOrg.setData(
        {
          orgId: variables.orgId,
        },
        ctx ? ctx.prevData : undefined,
      );
    },
    onSettled(_err, _variables, ctx) {
      void utils.notes.getByOrg.invalidate({ orgId: ctx.orgId });
    },
  });
};

export const useResetNotesMutation = () => {
  const utils = api.useUtils();
  return api.notes.reset.useMutation({
    async onMutate(variables) {
      await utils.notes.getByOrg.cancel();

      const prevData = utils.notes.getByOrg.getData({ orgId: variables.orgId });

      utils.notes.getByOrg.setData(
        {
          orgId: variables.orgId,
        },
        (old) => ({ ...old, notes: [] }),
      );

      return { prevData };
    },
    onError(_err, variables, ctx) {
      utils.notes.getByOrg.setData(
        {
          orgId: variables.orgId,
        },
        ctx ? ctx.prevData : undefined,
      );
    },
    onSettled(_err, _variables, ctx) {
      void utils.notes.getByOrg.invalidate({ orgId: ctx.orgId });
    },
  });
};
