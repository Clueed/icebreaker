import type { RouterOutputs } from "@acme/api";

import { GuessDisplay } from "~/app/org/[orgId]/_components/guess-display";
import { api } from "~/trpc/react";

export const GuessHistory = ({ orgId }: { orgId: string }) => {
  const { data, status, error, isError, isPending } = api.guess.all.useQuery({
    orgId,
  });

  if (isPending) return "Loading...";

  if (isError) return `Error! ${error.message}`;
  return (
    <>
      <Inner data={data} />
    </>
  );
};

const Inner = ({ data }: { data: RouterOutputs["guess"]["all"] }) => {
  return (
    <>
      {data?.map((guess) => <GuessDisplay key={guess.id} guessId={guess.id} />)}
    </>
  );
};
