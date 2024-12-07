import type { MouseEventHandler, TouchEventHandler } from "react";
import { useCallback, useRef, useState } from "react";

export const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: MouseEventHandler<HTMLButtonElement>,
  { shouldPreventDefault = true, delay = 300 } = {},
): {
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onTouchStart: TouchEventHandler<HTMLButtonElement>;
  onMouseUp: MouseEventHandler<HTMLButtonElement>;
  onMouseLeave: MouseEventHandler<HTMLButtonElement>;
  onTouchEnd: TouchEventHandler<HTMLButtonElement>;
} => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>(null);
  const target = useRef<EventTarget>(null);

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault],
  );

  const clear = useCallback(
    (event: MouseEvent | TouchEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      if (shouldTriggerClick && !longPressTriggered) {
        //@ts-expect-error events in typescript are strange
        onClick(event);
      }

      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered],
  );

  return {
    //@ts-expect-error events in typescript are strange
    onMouseDown: (e) => start(e),
    //@ts-expect-error events in typescript are strange
    onTouchStart: (e) => start(e),
    //@ts-expect-error events in typescript are strange
    onMouseUp: (e) => clear(e),
    //@ts-expect-error events in typescript are strange
    onMouseLeave: (e) => clear(e, false),
    //@ts-expect-error events in typescript are strange
    onTouchEnd: (e) => clear(e),
  };
};

const isTouchEvent = (event: Event): event is TouchEvent => {
  return "touches" in event;
};

const preventDefault: EventListenerOrEventListenerObject = (event) => {
  if (!isTouchEvent(event)) return;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};
