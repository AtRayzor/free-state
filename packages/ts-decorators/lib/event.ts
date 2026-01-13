import { EventSubject } from "free-state";

/**
 * Decorator that transforms a method into an EventSubject instance.
 *
 * When applied to a class method, this decorator replaces the method with a getter that
 * returns an EventSubject. The EventSubject wraps the original method, allowing subscribers
 * to observe when the method is invoked and react to its execution.
 *
 * @template T Function type extending (...args: any[]) => any
 * @param key Identifier for the event subject (useful for registries and debugging)
 * @returns A property decorator function
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @event('user-clicked')
 *   handleClick(x: number, y: number) {
 *     return { x, y };
 *   }
 * }
 *
 * const instance = new MyClass();
 * instance.handleClick.subscribe((coords) => {
 *   console.log('Clicked at:', coords);
 * });
 * instance.handleClick.invoke(10, 20);
 * ```
 */
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
