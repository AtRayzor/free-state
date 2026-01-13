import { EventSubject } from "free-state";

export function event<T extends (...args: any[]) => any>(key: any) {
  return (target: any, propertyKey: string) => {
    const original = target[propertyKey];
    const instanceSymbol = Symbol(propertyKey);

    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        const boundMethod = original.bind(target) as T;
        this[instanceSymbol] = new EventSubject<Parameters<T>, ReturnType<T>>(
          key,
          (...args: Parameters<T>) => boundMethod(...args),
        );
        return this[instanceSymbol] as EventSubject<
          Parameters<T>,
          ReturnType<T>
        >;
      },
      configurable: true,
      enumerable: false,
    });
  };
}
