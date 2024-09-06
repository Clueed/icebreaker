import { AddNewGuess } from "~/app/org/[orgId]/_components/add-new-guess/add-new-guess";
import { GuessHistory } from "~/app/org/[orgId]/_components/guess-history";
import NextPhoneNumberSelector from "~/app/org/[orgId]/_components/next-phone-number-selector";
import GuesserStrategySelector from "~/app/org/[orgId]/_components/strategy-selector.tsx/strategy-selector";

export const Guesser = ({ orgId }: { orgId: string }) => {
  return (
    <div className="mx-auto flex">
      <div>
        <GuesserStrategySelector
          orgId={orgId}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onApplyExtensionStrategyOnce={() => {}}
        />
        <AddNewGuess orgId={orgId} />
      </div>
      <div className="w-full">
        <NextPhoneNumberSelector orgId={orgId} />
        <GuessHistory orgId={orgId} />
      </div>
    </div>
  );
};
