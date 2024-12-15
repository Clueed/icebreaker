import { useState } from "react";

export const useScrollBoundries = () => {
  const [isTop, setIsTop] = useState(false);
  const [isBottom, setIsBottom] = useState(false);
  const [isBetween, setIsBetween] = useState(false);

  const handleOnScroll = (event: React.UIEvent<HTMLDivElement>) => {
    //@ts-expect-error - event are weird
    const scrollTop = event.target.scrollTop;
    //@ts-expect-error - event are weird
    const scrollHeight = event.target.scrollHeight;
    //@ts-expect-error - event are weird
    const clientHeight = event.target.clientHeight;
    const top = scrollTop === 0;
    const between = scrollTop > 0 && clientHeight < scrollHeight - scrollTop;
    const bottom = clientHeight === scrollHeight - scrollTop;

    if (top) {
      setIsTop(true);
      setIsBetween(false);
      setIsBottom(false);
      return;
    }

    if (between) {
      setIsBetween(true);
      setIsTop(false);
      setIsBottom(false);
      return;
    }

    if (bottom) {
      setIsBottom(true);
      setIsBetween(false);
      setIsTop(false);
      return;
    }
  };

  return {
    onScroll: handleOnScroll,
    isTop,
    isBottom,
    isBetween,
  };
};
