import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export const useCreateGuess = () => {
  const utils = api.useUtils();
  const { mutateAsync: createGuess } = api.guess.create.useMutation({
    onSuccess: (guess, variables) => {
      toast("guess created");
      utils.guess.all.invalidate({ orgId: variables.orgId });
      utils.guess.byId.invalidate({ id: guess.id });
    },
    onError: (error) => {
      toast("error creating guess: " + error.message);
    },
  });

  return { createGuess };
};
