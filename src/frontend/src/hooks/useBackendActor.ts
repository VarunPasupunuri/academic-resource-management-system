import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { Backend } from "../backend";

/**
 * Returns the backend actor instance.
 * This hook wraps the core-infrastructure useActor to get a typed Backend instance.
 */
export function useBackendActor(): {
  actor: Backend | null;
  isFetching: boolean;
} {
  return useActor(createActor) as {
    actor: Backend | null;
    isFetching: boolean;
  };
}
