const observersSymbol = Symbol("observer");
const invocationHandlerSymbol = Symbol("invocationHandler");

export type EventObserver<E> = E extends readonly (infer Args)[]
  ? (...args: Args[]) => void | Promise<void>
  : (event: E) => void | Promise<void>;

/**
 * Callback signature for subscribers to an event emission.
 * @template E Event payload type.
 * @param event The emitted event payload.
 */
export type EventCallback<E> = (event: E) => void | Promise<void>;

/**
 * Function signature that produces an event payload from arbitrary arguments.
 * @template E Event payload type.
 * @param args Arguments used to construct the event payload.
 * @returns The constructed event payload.
 */
export type EventTarget<E> = (...args: unknown[]) => E;

/**
 * Subject that manages observers for a typed event and dispatches emissions.
 * @template Params Tuple of argument types the event producer accepts.
 * @template E Event payload type.
 */
export class EventSubject<E extends readonly any[]> {
  [observersSymbol]: Set<EventObserver<E>> = new Set();
  [invocationHandlerSymbol]: () => E;

  /**
   * Create a new event subject.
   * @
   */
  constructor(handler: () => E) {
    this[invocationHandlerSymbol] = handler;
  }

  /**
   * Invoke the event producer, store the latest payload, and notify observers.
   */
  public async invoke(): Promise<void> {
    const event = this[invocationHandlerSymbol]();
    await this.notify(...event);
  }

  /**
   * Subscribe an observer to future emissions.
   * @param observer Handler invoked with each emitted payload.
   */
  public attach(observer: EventObserver<E>) {
    this[observersSymbol].add(observer);
  }

  /**
   * Unsubscribe a previously attached observer.
   * @param observer Handler to remove.
   */
  public detach(observer: EventObserver<E>) {
    this[observersSymbol].delete(observer);
  }

  private async notify(...args: E) {
   const promises = [...this[observersSymbol]].map((observer) => observer(...args));
   await Promise.all(promises);
  }
}

/**
 * Convenience factory to create an `EventSubject` from a producer function.
 * @returns A new `EventSubject` bound to the provided producer.
 */
export function createEvent<E extends readonly unknown[]>(handler: () => E) {
  return new EventSubject<E>(handler);
}
