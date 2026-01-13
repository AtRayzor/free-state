import { DefaultStore, Store } from "free-state";

const innerStoreKey = Symbol("innerStore");

export function extractStore(instance: any): Store<any> | null {
  const store = instance["__store"] as DefaultStore<any> | undefined;
  if (!store) {
    return null;
  }

  return store;
}

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
