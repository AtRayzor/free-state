/**
 * Minimal interface describing the reactive store surface area expected by
 * React integrations (e.g. via `useSyncExternalStore`).
 *
 * A conforming store must:
 * - let consumers subscribe to change notifications, returning an unsubscribe function
 * - provide a stable snapshot object representing the current state
 *
 * @typeParam T - The shape of the snapshot object exposed to consumers.
 */
export interface ReactiveStoreType<T> {
  /**
   * Registers a callback to be invoked whenever the store's state changes.
   *
   * Implementations should call the callback after any state mutation that would
   * change the value returned by `getSnapshot()`.
   *
   * @param callback - Function called on store updates.
   * @returns Cleanup function that unsubscribes the callback.
   */
  subscribe(callback: () => void): () => void;

  /**
   * Returns the current snapshot of the store's state.
   *
   * In React terms, this should be the value read by `useSyncExternalStore`.
   *
   * @returns A snapshot representing the current store state.
   */
  getSnapshot(): T;
}

const listenersKey = Symbol("listeners");
const snapshotKey = Symbol("snapshot");
const proxyKey = Symbol("proxy");

function _createSnapshot(target: any) {
  console.log("target = ", target);
  const snapshot: any = { ...target };
  // Remove internal machinery from the snapshot data
  snapshot[listenersKey] && delete snapshot[listenersKey];
  snapshot[proxyKey] && delete snapshot[proxyKey];
  snapshot["subscribe"] && delete snapshot["subscribe"];
  snapshot["getSnapshot"] && delete snapshot["getSnapshot"];
  // You might also want to delete the subscribe/getSnapshot methods from the data object
  return snapshot;
}

function createSetter(instance: any) {
  return (
    target: any,
    property: string | symbol,
    value: any,
    receiver: any,
  ) => {
    const result = Reflect.set(target, property, value, receiver);

    if (property === snapshotKey || property === listenersKey) {
      return result;
    }

    const snapshot = _createSnapshot(target);
    instance[proxyKey] = new Proxy(snapshot, { set: createSetter(instance) });
    instance[listenersKey].forEach((listener: () => void) => listener());

    return result;
  };
}

/**
 * Class decorator / higher-order class that turns a plain class into a reactive
 * store backed by Proxies.
 *
 * The returned class:
 * - wraps instances in a `Proxy` to intercept property assignments
 * - rebuilds a "snapshot" object after each mutation (excluding internal fields)
 * - notifies all subscribed listeners after snapshot updates
 *
 * This is designed to integrate cleanly with React’s external store pattern:
 * - `subscribe` is used to listen for changes
 * - `getSnapshot` is used to read the current snapshot value
 *
 * @example
 * ``` typescript
 * @ReactiveStore
 * class Counter {
 *   constructor(public count: number = 0) {}
 * }
 *
 * const store = new ReactiveCounter();
 * store.subscribe(() => console.log(store.getSnapshot().count));
 * store.inc(); // triggers listener; snapshot count increments
 * ````
 *
 * @typeParam T - Constructor type of the class being wrapped.
 * @param ctor - The class constructor to wrap.
 * @returns A new class extending `ctor` and implementing `ReactiveStoreType`.
 */
export function ReactiveStore<T extends { new (...args: any[]): {} }>(ctor: T) {
  return class extends ctor implements ReactiveStoreType<any> {
    // Hidden storage for listeners and the current snapshot
    [listenersKey]: Set<() => void> = new Set();
    [proxyKey]: any;
    constructor(...args: any[]) {
      super(...args);
      this[proxyKey] = new Proxy(_createSnapshot(this), {
        set: createSetter(this),
      });

      return new Proxy(this, {
        set: createSetter(this),
      });
    }

    /**
     * Registers a listener that will be called whenever any non-internal property
     * is assigned on the proxied instance.
     *
     * @param callback - Function invoked after the snapshot is refreshed.
     * @returns Unsubscribe function to remove the callback.
     */
    public subscribe = (callback: () => void) => {
      this[listenersKey].add(callback);
      // Return cleanup function
      return () => {
        this[listenersKey].delete(callback);
      };
    };

    /**
     * Returns the latest snapshot object for this store.
     *
     * Note: the snapshot is a shallow copy of the instance's enumerable
     * properties, with internal bookkeeping removed.
     *
     * @returns The current snapshot proxy.
     */
    public getSnapshot = () => {
      return this[proxyKey];
    };
  };
}
