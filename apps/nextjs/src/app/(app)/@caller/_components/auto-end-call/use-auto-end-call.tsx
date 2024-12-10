"use client";

import type { Duration } from "luxon";
import { useState } from "react";

export const useAutoEndCall = (args: {
  enabled: boolean;
  hangup: (() => Promise<void> | undefined) | undefined;
  inputs: {
    callDuration: Duration<true> | null;
    maxDuration: Duration<true>;
    buffer: Duration<true>;
  };
  onEnd?: () => void;
}) => {
  const { inputs } = args;
  const diff =
    inputs.callDuration &&
    inputs.maxDuration.minus(inputs.callDuration).plus(inputs.buffer);

  const [lock, setLock] = useState(false);

  if (args.enabled && diff) {
    if (diff.toMillis() < 0 && lock === false) {
      void args.hangup?.();
      setLock(true);
      args.onEnd?.();
    }
    if (diff.toMillis() > 0 && lock === true) {
      setLock(false);
    }
  }

  const decimalLeft = diff
    ? (diff.toMillis() / inputs.maxDuration.toMillis()) * 100
    : 100;

  return {
    diff,
    decimalLeft,
  };
};
