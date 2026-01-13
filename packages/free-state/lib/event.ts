const observersSymbol = Symbol("observer");

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
export type EventTarget<E> = (...args: any[]) => E;

/**
 * Subject that manages observers for a typed event and dispatches emissions.
 * @template Params Tuple of argument types the event producer accepts.
 * @template E Event payload type.
 */
export class EventSubject<Params extends readonly any[], E> {
  [observersSymbol]: Set<(event: E) => void | Promise<void>> = new Set();
  private readonly _key: any;
  private readonly _eventMethod: (...args: Params) => E;
  private _state?: E;

  /**
   * Create a new event subject.
   * @param key Identifier for this subject (useful for registries).
   * @param target Function that transforms args into an event payload.
   */
  constructor(key: any, target: (...args: Params) => E) {
    this._key = key;
    this._eventMethod = target;
  }

  /**
   * Get the identifier associated with this subject.
   */
  public get key() {
    return this._key;
  }

  /**
   * Invoke the event producer, store the latest payload, and notify observers.
   * @param args Arguments passed to the event producer.
   */
  public async invoke(...args: Params): Promise<void> {
    this._state = this._eventMethod(...args);
    this.notify();
  }

  /**
   * Subscribe an observer to future emissions.
   * @param observer Handler invoked with each emitted payload.
   */
  public attach(observer: (event: E) => void | Promise<void>) {
    this[observersSymbol].add(observer);
  }

  /**
   * Unsubscribe a previously attached observer.
   * @param observer Handler to remove.
   */
  public detach(observer: (event: E) => void | Promise<void>) {
    this[observersSymbol].delete(observer);
  }

  private notify() {
    const state = this._state;
    if (state === undefined) return;
    this[observersSymbol].forEach((observer) => observer(state));
  }
}

/**
 * Convenience factory to create an `EventSubject` from a producer function.
 * @template F Event producer function type.
 * @param subject Function that produces an event payload from its arguments.
 * @returns A new `EventSubject` bound to the provided producer.
 */
export function createEvent<F extends (...args: any[]) => any>(subject: F) {
  return new EventSubject<Parameters<F>, ReturnType<F>>("", subject);
}
