import { useSyncExternalStore } from "react";
import type { ReactiveStoreType } from "reactive-storage";

export type ReactiveStoreHook<T> = (store: T) => T;

export function useReactiveStore<T>(store: T): T {
  const reactiveStore = store as ReactiveStoreType<T>;
  return useSyncExternalStore(
    reactiveStore.subscribe,
    reactiveStore.getSnapshot,
  );
}
