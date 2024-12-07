import type { Variants } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@icebreaker/ui";

export const container = {
  hidden: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
} satisfies Variants;

export const item = {
  hidden: { x: "-2.5rem", opacity: 0 },
  show: {
    opacity: 1,
    x: 0,
  },
} satisfies Variants;

export const GuessStatsTreeHighlighter = (props: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "border-l-2 border-border transition-colors duration-500 hover:border-muted-foreground/75",
        props.className,
      )}
      children={props.children}
    />
  );
};
