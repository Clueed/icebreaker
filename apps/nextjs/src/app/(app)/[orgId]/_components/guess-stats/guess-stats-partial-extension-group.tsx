import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { RouterOutputs } from "@icebreaker/api";
import type { PhoneCallRatingNullable } from "@icebreaker/validators/phone-call-rating";
import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { ChevronDownIcon } from "@icebreaker/ui/icons";
import { getHighestRated } from "@icebreaker/validators/phone-call-rating";

import CircleGraph from "~/app/(app)/[orgId]/_components/circle-graph";
import {
  ExpandedContent,
  ExpandedContentGuesses,
} from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats-partial-extension-group-content";
import { GuessStatsTreeHighlighter } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats-tree-highlighter";
import { RatingEffect } from "~/app/(app)/@caller/_components/rating-effect";
import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";

export const GuessStatsPartialExtensionGroup = ({
  partialExtension,
  extensionLength,
  base,
  orgId,
}: {
  partialExtension: RouterOutputs["guess"]["stats"][number]["extensionLengthGroups"][number]["partialExtensionGroups"][number];
  extensionLength: number;
  base: string;
  orgId: string;
}) => {
  const max =
    10 ** (extensionLength - partialExtension.partialExtension.length);

  const [expanded, setExpanded] = useState(false);
  const showGuesses = max <= 10;

  return (
    <GuessStatsTreeHighlighter className={"h-min p-4 px-6"}>
      <motion.div layout="preserve-aspect" className="flex items-center gap-6">
        <GuessStatsPartialExtensionGroupHeader
          extensionLength={extensionLength}
          partialExtension={partialExtension.partialExtension}
          max={max}
          allRatings={partialExtension.ratings}
          guessCount={partialExtension.guessCount}
        />

        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDownIcon
            className={cn(
              "transition-transform duration-700 ease-in-out",
              expanded && "rotate-180",
            )}
          />
        </Button>
      </motion.div>

      <motion.div layout="preserve-aspect" className="pl-4">
        <AnimatePresence>
          {expanded && !showGuesses && (
            <ExpandedContent
              orgId={orgId}
              base={base}
              partialExtension={partialExtension.partialExtension}
              extensionLength={extensionLength}
              key={"123123"}
            />
          )}
          {expanded && showGuesses && (
            <ExpandedContentGuesses
              count={partialExtension.guessCount}
              orgId={orgId}
              base={base}
              partialExtension={partialExtension.partialExtension}
              extensionLength={extensionLength}
              key={"123123123123"}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </GuessStatsTreeHighlighter>
  );
};

const GuessStatsPartialExtensionGroupHeader = (props: {
  extensionLength: number;
  partialExtension: string;
  max: number;
  allRatings: PhoneCallRatingNullable[];
  guessCount: number;
}) => {
  const { allRatings, guessCount, max, partialExtension, extensionLength } =
    props;

  const partialExtensionLength = partialExtension.length;

  const rating = getHighestRated(allRatings);
  const percentDone = (guessCount / max) * 100;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <RatingEffect rating={rating}>
            <RatingIcon rating={rating} className={cn("size-[20px]")} />
          </RatingEffect>
        </div>
        <div className={cn(rating === null && "text-muted-foreground")}>
          <CircleGraph percentage={percentDone} size={40} strokeWidth={1} />
        </div>
      </div>
      <div>
        <h4 className="text-xl leading-loose tracking-widest">
          {partialExtension}
          <span className="opacity-50">
            {Array.from({
              length: extensionLength - partialExtensionLength,
            }).map(() => "X")}
          </span>
        </h4>
        <div className="text-xs text-muted-foreground">
          {guessCount}/{max}
        </div>
      </div>
    </div>
  );
};
