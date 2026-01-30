import { DerivedState } from "./derived-state";
import { Store } from "./store";

const internalListenersKey = Symbol("internalListeners");
const listenersKey = Symbol("listeners");
const snapshotKey = Symbol("snapshot");
const deriveStateInstancesKey = Symbol("deriveStateInstances");

function equalsShallow(
  obj1: Record<string, unknown> | null | undefined,
  obj2: Record<string, unknown> | null | undefined,
) {
  if (!obj1) return obj1 === obj2;
  if (!obj2) return false;
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  return Object.keys(obj1).reduce(
    (flag, key) => flag && obj1[key] === obj2[key],
    true,
  );
}

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

function updateStore(instance: any, source?: object) {
  const current = instance[snapshotKey];
  instance[snapshotKey] = source
    ? Object.assign({}, current, source)
    : Object.assign({}, current);

  if (!equalsShallow(current, instance[snapshotKey])) {
    notifySubscribers(instance);
  }
}

function createSetter(instance: any) {
  return (_: any, property: string, value: any) => {
    updateStore(instance, { [property]: value });

    return true;
  };
}

function createProxy(instance: any, target: any) {
  return new Proxy(target, {
    set: createSetter(instance),
    get: createGetter(instance),
  });
}

function createReadOnlyProxy(instance: any, target: any) {
  return new Proxy(target, {
    get: createGetter(instance),
    set: readOnlySetter,
  });
}

/**
 * Default implementation of the `Store` interface.
 *
 * Internally, `DefaultStore`:
 * - Maintains an immutable snapshot object (`snapshotKey`) representing the latest committed state.
 * - Exposes a **mutable proxy** for updates (`proxyKey`). Writing to it performs a copy-on-write update.
 * - Exposes a **readonly proxy** (`readonlyProxyKey`) for safe reading.
 *
 * Notifications:
 * - "Internal" listeners are intended for derived state so derived values can update first.
 * - Public listeners are those registered via `subscribe`.
 *
 * @typeParam T - The shape of the state object.
 */
export class DefaultStore<T extends object> implements Store<T> {
  [deriveStateInstancesKey]: Set<DerivedState<T, any>> = new Set();
  [internalListenersKey]: Set<() => void> = new Set();
  [listenersKey]: Set<() => void> = new Set();
  // @ts-ignore
  [snapshotKey]: T;

  /**
   * Creates a new store initialized with the given state object.
   *
   * @param initial - Initial state.
   */
  constructor(initial: T) {
    updateStore(this, initial);
  }

  /**
   * Creates a derived state value that tracks this store.
   *
   * @typeParam U - The derived value type.
   * @param transformer - Function to compute the derived value from the current snapshot.
   * @returns A derived state instance that stays in sync with this store.
   */
  derive<U>(transformer: (state: Readonly<T>) => U): DerivedState<T, U> {
    const derived = new DerivedState(
      transformer(this.readSnapshot()),
      this.subscribeInternal.bind(this),
      this.getSnapshot.bind(this),
      transformer,
    );
    this[deriveStateInstancesKey].add(derived);

    return derived;
  }

  /**
   * Applies a transformation to the state in a single atomic update.
   *
   * Implementation note:
   * - Copies the current proxy to a plain object snapshot.
   * - Applies the transformer.
   * - Rebuilds proxies and notifies subscribers once.
   *
   * @param transformer - Function producing the new state from the current state.
   */
  public transform(transformer: (state: Readonly<T>) => Readonly<T>) {
    const snapshot = this.readSnapshot();
    const transformed = transformer(snapshot);
    updateStore(this, transformed);
  }

  /**
   * Subscribes to store updates.
   *
   * @param callback - Called after each update.
   * @returns Unsubscribe function.
   */
  public subscribe = (callback: () => void): (() => void) => {
    this[listenersKey].add(callback);
    // Return cleanup function
    return () => {
      this[listenersKey].delete(callback);
    };
  };

  /**
   * Returns the readonly snapshot proxy of the current state.
   *
   * @returns Readonly state proxy.
   */
  public getSnapshot() {
    return this.readSnapshot() as Readonly<T>;
  }

  /**
   * Returns the mutable proxy of the current state.
   *
   * Mutations on this proxy will:
   * - Create a new underlying snapshot
   * - Recreate proxies
   * - Notify subscribers
   *
   * @returns Mutable state proxy.
   */
  public getProxy(): T {
    return createProxy(this, this.readSnapshot()) as T;
  }

  public getReadonlyProxy(): Readonly<T> {
    return createReadOnlyProxy(this, this.readSnapshot());
  }

  public update(state: T) {
    updateStore(this, state);
  }

  private subscribeInternal(callback: () => void): () => void {
    this[internalListenersKey].add(callback);

    return () => {
      this[internalListenersKey].delete(callback);
    };
  }

  private readSnapshot() {
    return this[snapshotKey];
  }
}

/**
 * Convenience factory for creating a `Store` using the default implementation.
 *
 * @typeParam T - The shape of the state object.
 * @param initial - Initial state.
 * @returns A new store instance.
 */
export function createStore<T extends object>(initial: T): Store<T> {
  return new DefaultStore(initial);
}
