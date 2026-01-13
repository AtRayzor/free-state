import { DefaultStore, Store } from "free-state";

const innerStoreKey = Symbol("innerStore");

/**
 * Extracts the internal Store instance from a decorated class instance.
 *
 * When a class is decorated with @store, this function retrieves the underlying
 * Store object that manages the reactive state.
 *
 * @param instance The class instance decorated with @store
 * @returns The Store instance if found, null otherwise
 *
 * @example
 * ```typescript
 * @store
 * class MyState {
 *   count = 0;
 * }
 *
 * const state = new MyState();
 * const storeInstance = extractStore(state);
 * if (storeInstance) {
 *   storeInstance.subscribe(() => console.log('State changed'));
 * }
 * ```
 */
export function extractStore(instance: any): Store<any> | null {
  const store = instance["__store"] as DefaultStore<any> | undefined;
  if (!store) {
    return null;
  }

  return store;
}

/**
 * Class decorator that transforms a class into a reactive store.
 *
 * When applied to a class, this decorator wraps the instance in a proxy that
 * automatically tracks property changes through a DefaultStore. Any property
 * modifications trigger reactive updates to subscribers.
 *
 * @template T The class constructor type
 * @param ctor The constructor function of the class to be decorated
 * @returns A new constructor that creates reactive store instances
 *
 * @example
 * ```typescript
 * @store
 * class AppState {
 *   count = 0;
 *   name = 'Alice';
 * }
 *
 * const state = new AppState();
 * const storeInstance = extractStore(state);
 * storeInstance?.subscribe(() => {
 *   console.log('State updated:', state.count);
 * });
 *
 * state.count = 42; // Triggers reactive update
 * ```
 */
export function store<T extends { new (...args: any[]): {} }>(ctor: T) {
  return class extends ctor {
    [innerStoreKey]: DefaultStore<any>;

    constructor(...args: any[]) {
      super();
      const instance = new ctor(...args);
      this[innerStoreKey] = new DefaultStore<any>(Object.assign({}, instance));

      return new Proxy(this, {
        set: (target: any, property: string, value: any) => {
          const proxy = target[innerStoreKey].getProxy();

          if (!proxy.hasOwnProperty(property)) {
            return false;
          }

          Reflect.set(proxy, property, value);
          return true;
        },
        get: (target: any, property: string) => {
          if (property === "__store") return target[innerStoreKey];
          const snapshot = target[innerStoreKey].getSnapshot();
          const localInstance = new ctor();
          Object.assign(localInstance, snapshot);
          return Reflect.get(localInstance, property);
        },
      });
    }
  };
}
