import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";

import { api } from "~/trpc/react";

export const GuessHistory = ({
  orgId,
  setSelectedGuessId,
}: {
  orgId: string;
  setSelectedGuessId: (id: string) => void;
}) => {
  const [guesses] = api.guess.all.useSuspenseQuery({ orgId });

  function handleOnClick(guessId: string): void {
    console.log("guessId", guessId);
  }
  return (
    <div className="flex flex-col gap-2">
      {guesses.map((guess) => (
        <HistroyGuess
          key={guess.id}
          guess={guess}
          onClick={() => setSelectedGuessId(guess.id)}
        />
      ))}
    </div>
  );
};

const HistroyGuess = ({
  guess,
  onClick,
}: {
  guess: AppRouterOutputs["guess"]["all"][0];
  onClick: () => void;
}) => {
  return (
    <div className="flex gap-1 border-2 p-4" onClick={onClick}>
      <div>{guess.phoneNumber.base}</div>-
      <div>{guess.phoneNumber.extension}</div>
    </div>
  );
};
