import { useMemo, useState } from "react";

import type { RouterInputs } from "@icebreaker/api";

import { api } from "~/trpc/react";

export const useGuessNextQuery = (inputs: RouterInputs["guess"]["next"]) => {
  const { data, ...rest } = api.guess.next.useInfiniteQuery(inputs, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const nextGuesses = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.pages.flatMap((page) => page.data);
  }, [data]);

  return {
    data: nextGuesses,
    ...rest,
  };
};

export const useGuessNextQueryStableGuessId = (
  inputs: RouterInputs["guess"]["next"],
) => {
  const { guessId: inputGuessId, ...inputsRest } = inputs;
  const [stableGuessId, setStableGuessId] = useState(inputGuessId);

  const { data, ...queryRest } = useGuessNextQuery({
    guessId: stableGuessId,
    ...inputsRest,
  });

  const inputGuessInData = useMemo(
    () => Boolean(data.find((g) => g.id === inputGuessId)),
    [data, inputGuessId],
  );

  if (
    !inputGuessInData &&
    !queryRest.isFetching &&
    stableGuessId !== inputGuessId
  ) {
    setStableGuessId(inputGuessId);
  }

  return { data, ...queryRest };
};
