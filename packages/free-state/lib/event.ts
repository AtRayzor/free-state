const observersSymbol = Symbol("observer");

export type EventCallback<E> = (event: E) => void | Promise<void>;
export type EventTarget<E> = (...args: any[]) => E;

export class EventSubject<Params extends readonly any[], E> {
  [observersSymbol]: Set<(event: E) => void | Promise<void>> = new Set();
  private readonly _key: any;
  private readonly _eventMethod: (...args: Params) => E;
  private _state?: E;
  constructor(key: any, target: (...args: Params) => E) {
    this._key = key;
    this._eventMethod = target;
  }

  public get key() {
    return this._key;
  }

  public async invoke(...args: Params): Promise<void> {
    this._state = this._eventMethod(...args);
    this.notify();
  }

  public attach(observer: (event: E) => void | Promise<void>) {
    this[observersSymbol].add(observer);
  }

  public detach(observer: (event: E) => void | Promise<void>) {
    this[observersSymbol].delete(observer);
  }

  private notify() {
    const state = this._state;
    if (state === undefined) return;
    this[observersSymbol].forEach((observer) => observer(state));
  }
}

export function createEvent<F extends (...args: any[]) => any>(subject: F) {
  return new EventSubject<Parameters<F>, ReturnType<F>>("", subject);
}
