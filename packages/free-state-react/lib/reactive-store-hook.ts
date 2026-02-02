import {useMemo, useSyncExternalStore} from "react";
import  {DefaultStore, Store} from "free-state";
import {AllowedStoreState} from "free-state";


/**
 * A React hook type for working with reactive stores.
 * @template T - The type of the store or instance
 */
export type ReactiveStoreHook<T> = (store: T) => T;

// @ts-expect-error
function getStoreFromDecoratedInstance<T extends object>(input: any) {
  throw Error("Decorator stores are no longer supported.");
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
 * @deprecated Prefer useSnapshot, useTransform, or useSnapshotWithSetters.
 *
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
 * @deprecated
 * Use the useSnapshot or useProxy hooks.
 */
export function useStore<T extends object>(instance: T): void;

/**
 *
 * @param input - The store input value
 *
 * @deprecated
 * Prefer useSnapshot, useTransform, and useSnapshotWithSetters
 */
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

function useSyncInternal<T extends AllowedStoreState>(
  store: Store<T>,
  func: "getSnapshot" | "getProxy",
) {
  const getFunction = store[func].bind(store);
  return useSyncExternalStore(store.subscribe.bind(store), getFunction) as T;
}

export function useSync<T extends AllowedStoreState>(store: Store<T>){
  useSnapshot<T>(store);
}

/**
 * React hook that returns the current immutable snapshot of a store's state.
 *
 * This hook subscribes to the provided store and triggers a re-render whenever
 * the store emits an update. It returns a plain, read-only snapshot representing
 * the state at the time of the render. Because the snapshot is immutable, it is
 * safe to use with memoization and referential equality checks.
 *
 * @template T - The type of the store state
 * @param {Store<T>} store - The store to subscribe to
 * @returns {T} The current immutable snapshot of the store's state
 *
 * @example
 * ```tsx
 * import { Store } from "free-state";
 * import { useSnapshot } from "free-state-react";
 *
 * const counterStore = new Store({ count: 0 });
 *
 * function Counter() {
 *   const state = useSnapshot(counterStore);
 *   return (
 *     <button onClick={() => counterStore.update(s => ({ count: s.count + 1 }))}>
 *       Count: {state.count}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSnapshot<T extends AllowedStoreState>(store: Store<T>): T {
  return useSyncInternal<T>(store, "getSnapshot");
}

/**
 * React hook that returns a reactive proxy of a store's state.
 *
 * This hook subscribes to the provided store and returns a Proxy that reflects
 * the current state. Accessing properties on the proxy within a component will
 * register usage, and the component will re-render when those properties change.
 * Use this when you prefer a reactive programming model with property access
 * over immutable snapshots.
 *
 * @template T - The type of the store state
 * @param {Store<T>} store - The store to subscribe to
 * @returns {T} A reactive proxy representing the store's current state
 *
 * @example
 * ```tsx
 * import { Store } from "free-state";
 * import { useProxy } from "free-state-react";
 *
 * const todosStore = new Store({ todos: [] as string[] });
 *
 * function Todos() {
 *   const state = useProxy(todosStore);
 *
 *   const addTodo = () => {
 *     todosStore.update(s => ({ ...s, todos: [...s.todos, "New todo"] }));
 *   };
 *
 *   return (
 *     <div>
 *       <ul>
 *         {state.todos.map((t, i) => (
 *           <li key={i}>{t}</li>
 *         ))}
 *       </ul>
 *       <button onClick={addTodo}>Add</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @deprecated
 * Avoid directly using proxy object inside React components and hooks.
 * Prefer useSnapshot or useTransform.
 */
export function useProxy<T extends AllowedStoreState>(store: Store<T>): T {
  return useSyncInternal<T>(store, "getProxy");
}

function createSetter<T extends AllowedStoreState, K extends keyof T>(transform: Store<T>['transform'], propertyKey: K){
  return (value: T[K]) => {
    transform((current) => Object.assign({}, current, {[propertyKey]: value}));
  }
}


type SetterName<K extends string | number | symbol> = K extends string ? `set${Capitalize<K>}` : never;
export type SnapshotSetters<T extends AllowedStoreState> =  {
  [K in keyof T as SetterName<K>]: (value: T[K]) => void
};

export type SnapshotWithSettersReturn<T extends AllowedStoreState> = [Readonly<T>, SnapshotSetters<T>]

export function useSnapshotWithSetters<T extends AllowedStoreState>(store: Store<T>): SnapshotWithSettersReturn<T>{
  const [state, transform] = useTransform(store);

  const setters = useMemo(() => {
    const bound = store.transform.bind(store);
    const setterEntries = Object.getOwnPropertyNames(state).map(prop => {
      const capitalized  = prop.at(0)?.toUpperCase() + prop.slice(1);
      const propName = `set${capitalized}`;
      const setter = createSetter(bound, prop as keyof T);

      return [propName, setter];
    });

    return Object.fromEntries(setterEntries) as SnapshotSetters<T>;

  }, [state, transform])

  const snapshot = useSyncExternalStore(store.subscribe.bind(store), store.getSnapshot.bind(store));

  return [snapshot, setters];

}

export function useTransform<T extends AllowedStoreState>(
  store: Store<T>,
): [T, Store<T>["transform"]] {
  const snapshot = useSnapshot(store);
  const transform = store.transform.bind(store);

  return [snapshot, transform];
}
