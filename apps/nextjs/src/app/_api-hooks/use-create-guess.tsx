import { toast } from "@icebreaker/ui/toast";

import { api } from "~/trpc/react";

export const useCreateGuess = () => {
  const utils = api.useUtils();
  const { mutateAsync: createGuess } = api.guess.create.useMutation({
    onSuccess: (guess, variables) => {
      toast("guess created");
      void utils.guess.all.invalidate({ orgId: variables.orgId });
      void utils.guess.byId.invalidate({ id: guess.id });
    },
    onError: (error) => {
      toast("error creating guess: " + error.message);
    },
  });

  return { createGuess };
};
