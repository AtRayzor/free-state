import { DerivedState } from "./derived";

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
export interface Store<T extends object> {
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

  getProxy(): T;

  getSnapshot(): Readonly<T>;

  transform(transformer: (state: Readonly<T>) => Readonly<T>): void;

  derive<U>(transformer: (state: Readonly<T>) => U): DerivedState<T, U>;
}

const internalListenersKey = Symbol("internalListeners");
const listenersKey = Symbol("listeners");
const readonlyProxyKey = Symbol("readonlyProxy");
const proxyKey = Symbol("proxy");
const snapshotKey = Symbol("snapshot");
const deriveStateInstancesKey = Symbol("deriveStateInstances");

function notifySubscribers(instance: any) {
  instance[internalListenersKey].forEach((listener: () => void) => listener());
  instance[listenersKey].forEach((listener: () => void) => listener());
}

function createGetter(instance: any) {
  return (_: any, property: string) => {
    return instance[snapshotKey][property];
  };
}

function readOnlySetter(): boolean {
  throw new Error("Readonly property cannot be modified");
}

function updateStore(
  target: any,
  instance: any,
  snapshot: object,
  source?: object,
) {
  instance[snapshotKey] = source
    ? Object.assign({}, snapshot, source)
    : Object.assign({}, snapshot);
  instance[proxyKey] = new Proxy(target, {
    set: createSetter(instance),
    get: createGetter(instance),
  });
  instance[readonlyProxyKey] = new Proxy(target, {
    set: readOnlySetter,
    get: createGetter(instance),
  });
}

function createSetter(instance: any) {
  return (target: any, property: string, value: any) => {
    updateStore(target, instance, instance[snapshotKey], { [property]: value });
    notifySubscribers(instance);

    return true;
  };
}

export class DefaultStore<T extends object> implements Store<T> {
  [deriveStateInstancesKey]: Set<DerivedState<T, any>> = new Set();
  [internalListenersKey]: Set<() => void> = new Set();
  [listenersKey]: Set<() => void> = new Set();
  // @ts-ignore
  [snapshotKey]: T;
  [proxyKey]: any;
  [readonlyProxyKey]: any;
  constructor(initial: T) {
    updateStore(initial, this, initial);
  }

  derive<U>(transformer: (state: Readonly<T>) => U): DerivedState<T, U> {
    const derived = new DerivedState(
      transformer(this[snapshotKey]),
      this.subscribeInternal.bind(this),
      this.getSnapshot.bind(this),
      transformer,
    );
    this[deriveStateInstancesKey].add(derived);

    return derived;
  }

  public transform(transformer: (state: Readonly<T>) => Readonly<T>) {
    const snapshot = { ...this[proxyKey] } as T;
    const transformed = transformer(snapshot);
    updateStore(snapshot,this, snapshot, transformed);
    notifySubscribers(this);
  }

  /**
   * Registers a listener that will be called whenever any non-internal property
   * is assigned on the proxied instance.
   *
   * @param callback - Function invoked after the snapshot is refreshed.
   * @returns Unsubscribe function to detach the callback.
   */
  public subscribe = (callback: () => void): (() => void) => {
    this[listenersKey].add(callback);
    // Return cleanup function
    return () => {
      this[listenersKey].delete(callback);
    };
  };

  public getSnapshot() {
    return this[readonlyProxyKey] as Readonly<T>;
  }

  public getProxy(): T {
    return this[proxyKey] as T;
  }

  private subscribeInternal(callback: () => void): () => void {
    this[internalListenersKey].add(callback);

    return () => {
      this[internalListenersKey].delete(callback);
    };
  }
}

export function createStore<T extends object>(initial: T): Store<T> {
  return new DefaultStore(initial);
}
