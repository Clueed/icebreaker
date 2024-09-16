import { AnimatePresence, motion } from "framer-motion";

import type { RouterOutputs } from "@icebreaker/api";

import { GuessStatsPartialExtensionGroup } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats-partial-extension-group";
import { GuessStatsTreeHighlighter } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats-tree-highlighter";

export const GuessStatsBaseGroup = (props: {
  baseGroup: RouterOutputs["guess"]["stats"][number];
  orgId: string;
}) => {
  const { base, extensionLengthGroups } = props.baseGroup;

  return (
    <GuessStatsTreeHighlighter className="space-y-4 py-4 pl-4">
      <motion.h2
        layout
        className="text-lg font-medium tracking-widest text-muted-foreground"
      >
        {base}-
      </motion.h2>

      <AnimatePresence>
        {extensionLengthGroups.map((extensionLengthGroup) => (
          <motion.div layout="preserve-aspect" className="flex gap-4">
            <h3 className="flex flex-col items-center gap-1 py-2 text-xs">
              <div>{extensionLengthGroup.extensionLength}</div>
              <div
                className="text-xs uppercase tracking-widest text-muted-foreground/50"
                style={{ writingMode: "vertical-rl" }}
              >
                {Array.from({
                  length: extensionLengthGroup.extensionLength,
                }).map(() => "X")}
              </div>
            </h3>
            <motion.div
              layout="preserve-aspect"
              className="flex flex-wrap gap-8"
            >
              <AnimatePresence>
                {extensionLengthGroup.partialExtensionGroups.map(
                  (partialExtension) => (
                    <GuessStatsPartialExtensionGroup
                      key={partialExtension.partialExtension}
                      base={base}
                      extensionLength={extensionLengthGroup.extensionLength}
                      partialExtension={partialExtension}
                      orgId={props.orgId}
                    />
                  ),
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </GuessStatsTreeHighlighter>
  );
};
