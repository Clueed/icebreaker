import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@icebreaker/ui/button";
import { Skeleton } from "@icebreaker/ui/skeleton";

import {
  useSelectedGuessIsPending,
  useSetSelectedGuessId,
} from "~/app/_api-hooks/use-selected-guess";
import { GuessDisplay } from "~/app/(app)/[orgId]/_components/guess-display";
import { GuessStatsPartialExtensionGroup } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats-partial-extension-group";
import {
  container,
  item,
} from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats-tree-highlighter";
import { api } from "~/trpc/react";

export const ExpandedContent = ({
  orgId,
  base,
  partialExtension,
  extensionLength,
}: {
  orgId: string;
  base: string;
  partialExtension: string;
  extensionLength: number;
}) => {
  const {
    data: stats,
    isSuccess,
    isLoading,
  } = api.guess.stats.useQuery(
    {
      orgId,
      base: base,
      partialExtension: partialExtension,
      extensionLength: extensionLength,
    },
    {
      select: (data) =>
        data.flatMap((baseGroup) =>
          baseGroup.extensionLengthGroups.flatMap((extensionLengthObj) => ({
            extensionLength: extensionLengthObj.extensionLength,
            partialExtensionGroups:
              extensionLengthObj.partialExtensionGroups.flatMap(
                (partialExtension) => partialExtension,
              ),
          })),
        ),
    },
  );

  return (
    <motion.div
      layout="preserve-aspect"
      variants={container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="flex flex-wrap gap-2 py-4"
    >
      <AnimatePresence>
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-12 w-32 flex-grow" key={index}></Skeleton>
          ))}
        {isSuccess &&
          stats.map(({ extensionLength, partialExtensionGroups }) =>
            partialExtensionGroups.map((partialExtensionGroup) => (
              <motion.div
                layout="preserve-aspect"
                variants={item}
                key={partialExtensionGroup.partialExtension}
              >
                <GuessStatsPartialExtensionGroup
                  base={base}
                  extensionLength={extensionLength}
                  partialExtension={partialExtensionGroup}
                  orgId={orgId}
                />
              </motion.div>
            )),
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export const ExpandedContentGuesses = ({
  orgId,
  base,
  partialExtension,
  extensionLength,
  count,
}: {
  orgId: string;
  base: string;
  partialExtension: string;
  extensionLength: number;
  count: number;
}) => {
  const {
    data: guesses,
    isSuccess,
    isLoading,
  } = api.guess.getByPhoneNumber.useQuery({
    orgId,
    base: base,
    partialExtension: partialExtension,
    extensionLength: extensionLength,
  });

  const { mutate: setSelectedGuessId } = useSetSelectedGuessId();
  const isPending = useSelectedGuessIsPending({
    orgId,
  });

  return (
    <motion.div
      layout
      variants={container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="mt-8 flex flex-wrap gap-x-8 gap-y-6"
    >
      <AnimatePresence>
        {isLoading &&
          Array.from({ length: count }).map((_, index) => (
            <Skeleton className="h-12 w-32 flex-grow" key={index}></Skeleton>
          ))}
        {isSuccess &&
          guesses.map((guess) => (
            <motion.div layout="preserve-aspect" variants={item} key={guess.id}>
              <Button
                variant={"ghost"}
                className="text-md w-full px-6 py-4 text-inherit"
                onClick={() =>
                  setSelectedGuessId({
                    orgId,
                    data: {
                      selectedGuessId: guess.id,
                    },
                  })
                }
                disabled={isPending}
              >
                <GuessDisplay guess={guess} />
              </Button>
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  );
};
