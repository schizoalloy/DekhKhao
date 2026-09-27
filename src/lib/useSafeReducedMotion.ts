"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `useReducedMotion` that is always `false` during SSR and hydration, so
 * components that branch their markup on it never cause a hydration mismatch.
 */
export function useSafeReducedMotion(): boolean {
  const reduce = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return hydrated && !!reduce;
}
