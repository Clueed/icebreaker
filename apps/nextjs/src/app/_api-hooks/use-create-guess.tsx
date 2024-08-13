import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export const useCreateGuess = () => {
  const utils = api.useUtils();
  const { mutateAsync: createGuess } = api.guess.create.useMutation({
    onSuccess: async (guess, variables) => {
      toast("guess created");
      await utils.guess.all.invalidate({ orgId: variables.orgId });
      await utils.guess.byId.invalidate({ id: guess.id });
    },
    onError: (error) => {
      toast("error creating guess: " + error.message);
    },
  });

  return { createGuess };
};
