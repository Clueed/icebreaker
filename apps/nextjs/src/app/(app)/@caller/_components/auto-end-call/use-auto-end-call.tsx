"use client";

import type { HTMLAttributes } from "react";
import { useSessionStorage } from "usehooks-ts";

import { useCountdown } from "@icebreaker/ui/hooks/use-countdown";

import { useCall } from "~/app/_components/call-handler/use-current-call";

export const useAutoEndCall = () => {
  const [enabled, setEnabled] = useSessionStorage("autoEndEnabled", false);
  const [resetOnAnswer, setResetOnAnswer] = useSessionStorage(
    "autoEndResetOnAnswer",
    true,
  );
  const [maxDurationS, setMaxDurationS] = useSessionStorage("maxDuration", 20);

  const { active, hangup } = useCall({
    callbacks: {
      onStart: () => {
        resetCountdown();
        startCountdown();
      },
      onAnswer: () => {
        if (!resetOnAnswer) {
          return;
        }
        resetCountdown();
        startCountdown();
      },
      onEnd: () => {
        stopCountdown();
        resetCountdown();
      },
    },
  });

  const [
    countdown,
    { isRunning, startCountdown, stopCountdown, resetCountdown },
  ] = useCountdown({
    countStart: maxDurationS,
    countStop: 0,
    isIncrement: false,
    callbacks: {
      onCountdownEnd: () => void hangup(),
    },
  });

  const isPaused = enabled && active && !isRunning;
  const register = {
    onMouseOver: () => enabled && active && stopCountdown(),
    onMouseOut: () => enabled && startCountdown(),
  } satisfies HTMLAttributes<HTMLDivElement>;
  const percentLeft =
    enabled && active ? (countdown / maxDurationS) * 100 : 100;

  return {
    setMaxDurationS,
    maxDurationS,
    enabled,
    setEnabled,
    isPaused,
    percentLeft,
    register,
    resetOnAnswer,
    setResetOnAnswer,
  };
};
