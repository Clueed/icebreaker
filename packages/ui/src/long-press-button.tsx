import type { MouseEventHandler } from "react";
import { forwardRef } from "react";

import type { ButtonProps } from "./button";
import { Button } from "./button";
import { useLongPress } from "./hooks/use-long-press";

type Props = ButtonProps & {
  onLongPress: () => void;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export const LongPressButton = forwardRef<HTMLButtonElement, Props>(
  ({ onClick, onLongPress, ...props }, ref) => {
    const longPress = useLongPress(onLongPress, onClick);
    return <Button {...props} {...longPress} ref={ref} />;
  },
);

LongPressButton.displayName = "LongPressButton";
