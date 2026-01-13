import {useSyncExternalStore} from "react";
import {DefaultStore, Store} from "free-state";

let decoratorModule: any;
import("@free-state/ts-decorators").then((mod) => {
  decoratorModule = mod;
});

/**
 * A React hook type for working with reactive stores.
 * @template T - The type of the store or instance
 */
export type ReactiveStoreHook<T> = (store: T) => T;

function getStoreFromDecoratedInstance<T extends object>(input: any) {
  return decoratorModule?.extractStore(input) as Store<T>;
}

/**
 * React hook that subscribes to a Store instance and returns a reactive proxy.
 *
 * This hook can be used in two ways:
 * 1. With a Store instance: Returns a reactive proxy of the store's state
 * 2. With a decorated class instance: Subscribes to the instance's internal store
 *
 * @template T - The type of the store state or decorated instance
 * @param {Store<T>} store - A Store instance to subscribe to
 * @returns {T} A reactive proxy of the store's state
 *
 * @example
 * ```tsx
 * const store = new Store({ count: 0 });
 * const state = useStore(store);
 * console.log(state.count); // 0
 * ```
 */
export function useStore<T extends object>(store: Store<T>): T;

/**
 * React hook that subscribes to a decorated class instance's internal store.
 *
 * @template T - The type of the decorated instance
 * @param {T} instance - A decorated class instance with an internal store
 * @returns {void}
 *
 * @example
 * ```tsx
 * class Counter {
 *   @reactive count = 0;
 * }
 * const counter = new Counter();
 * useStore(counter); // Subscribes to counter's reactive properties
 * ```
 */
export function useStore<T extends object>(instance: T): void;

export function useStore<T extends object>(input: any): any {
  if (!input) throw Error("The input is not defined.");
  const store =
    input instanceof DefaultStore
      ? (input as Store<T>)
      : getStoreFromDecoratedInstance(input);
  if (!store) throw Error("");

  const proxy = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getProxy.bind(store),
  );

  return input instanceof DefaultStore ? (proxy as T) : undefined;
}
