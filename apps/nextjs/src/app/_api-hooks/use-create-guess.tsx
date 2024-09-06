import { useCallback } from "react";

import type { RouterInputs } from "@icebreaker/api";
import { toast } from "@icebreaker/ui/toast";

import { useSetSelectedGuessId } from "~/app/_api-hooks/use-selected-guess";
import { api } from "~/trpc/react";

export const useCreateGuess = () => {
  const utils = api.useUtils();
  return api.guess.create.useMutation({
    onSuccess: (guess, variables) => {
      toast("guess created");
      void utils.guess.history.invalidate({ orgId: variables.orgId });
      void utils.guess.byId.invalidate({ id: guess.id });
    },
    onError: (error) => {
      toast("error creating guess: " + error.message);
    },
  });
};

export const useCreateSelectedGuess = (args?: { onSucess?: () => void }) => {
  const { mutateAsync: createGuess, isPending: createGuessIsPending } =
    useCreateGuess();
  const { mutate: setSelectedGuessId, isPending: setSelectedGuessIdIsPending } =
    useSetSelectedGuessId();

  const isPending = createGuessIsPending || setSelectedGuessIdIsPending;

  return {
    mutate: useCallback(
      async (data: RouterInputs["guess"]["create"]) => {
        const newGuess = await createGuess(data);
        setSelectedGuessId(
          {
            orgId: newGuess.orgId,
            data: { selectedGuessId: newGuess.id },
          },
          {
            onSuccess: args?.onSucess,
          },
        );
      },
      [args?.onSucess, createGuess, setSelectedGuessId],
    ),
    isPending,
  };
};
