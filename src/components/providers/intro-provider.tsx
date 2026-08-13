"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type IntroContextValue = {
  /** True once the intro has finished, or immediately when it is skipped. */
  ready: boolean;
  markReady: () => void;
};

const IntroContext = createContext<IntroContextValue>({
  ready: true,
  markReady: () => {},
});

/**
 * The hero's entry animation has to start after the intro clears, and the intro
 * only plays on the first visit of a session.
 *
 * Coordinating that through a window event and a dataset flag looked tidy but
 * was a race: any path where the loader decided not to play left the flag set
 * and the event never fired, so the hero waited forever and its headline stayed
 * inside its mask. Shared state has no such failure mode — `ready` is either
 * true or it isn't, and a late subscriber still sees it.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  const value = useMemo<IntroContextValue>(
    () => ({ ready, markReady: () => setReady(true) }),
    [ready],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  return useContext(IntroContext);
}
