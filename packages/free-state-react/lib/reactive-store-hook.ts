import {useSyncExternalStore} from "react";
import {DefaultStore, Store} from "free-state";

let decoratorModule: any;
import("@free-state/ts-decorators").then((mod) => {
  decoratorModule = mod;
});

export type ReactiveStoreHook<T> = (store: T) => T;

function getStoreFromDecoratedInstance<T extends object>(input: any) {
  return decoratorModule?.extractStore(input) as Store<T>;
}

export function useStore<T extends object>(store: Store<T>): T;
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
