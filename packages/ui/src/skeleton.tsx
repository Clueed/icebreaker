import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@icebreaker/ui";

const skeletonVariants = cva("rounded-md bg-muted/50", {
  variants: {
    animate: {
      true: "animate-pulse",
      false: "animate-none",
    },
    size: {
      char: "mx-[0.1ch] inline-block h-[1.7cap] w-[1.3ch] rounded-sm align-middle",
    },
  },
  defaultVariants: {
    animate: true,
  },
});

function Skeleton({
  className,
  animate,
  size,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants>) {
  return (
    <div
      className={cn(skeletonVariants({ size, animate }), className)}
      {...props}
    />
  );
}

export { Skeleton };
