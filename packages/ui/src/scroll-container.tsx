import type { ComponentProps } from "react";

import { cn } from ".";
import { useScrollBoundries } from "./hooks/use-scroll-boundries";

export const ScrollContainer = ({
  className,
  containerClassName,
  style,
  ...props
}: ComponentProps<"div"> & { containerClassName?: string }) => {
  const { onScroll, isTop, isBottom, isBetween } = useScrollBoundries();

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20 w-full border-t-2 border-muted/50 opacity-0 transition-opacity duration-500",
          (isBetween || isBottom) && "opacity-100",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full border-b-2 border-muted/50 opacity-0 transition-opacity duration-500",
          (isBetween || isTop) && "opacity-100",
        )}
      />
      <div
        className={cn("overflow-y-scroll px-3", className)}
        onScroll={onScroll}
        style={{
          maskImage: getScrollShadowMask(isTop, isBottom, isBetween),
          ...style,
        }}
        {...props}
      />
    </div>
  );
};

const getScrollShadowMask = (
  isTop: boolean,
  isBottom: boolean,
  isBetween: boolean,
) => {
  if (isTop) {
    return "linear-gradient(to bottom, rgba(1, 1, 1, 1) 90%, rgba(1, 1, 1, 0) 100%)";
  }

  if (isBottom) {
    return "linear-gradient(to bottom, rgba(1, 1, 1, 0) 0%, rgba(1, 1, 1, 1) 10%)";
  }

  if (isBetween) {
    return "linear-gradient(to bottom, rgba(1, 1, 1, 0) 0%, rgba(1, 1, 1, 1) 10%, rgba(1, 1, 1, 1) 90%, rgba(1, 1, 1, 0) 100%)";
  }

  return undefined;
};
