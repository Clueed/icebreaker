"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";

export const AnimatedMain = (props: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [animateRef] = useAutoAnimate({
    duration: 1000,
  });
  return (
    <main ref={animateRef} className={props.className}>
      {props.children}
    </main>
  );
};
