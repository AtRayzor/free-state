/**
 * A derived state that automatically updates based on changes to a parent state.
 *
 * @template T - The type of the parent state snapshot
 * @template D - The type of the derived value
 *
 * @example
 * ```typescript
 * const derived = new DerivedState(
 *   initialValue,
 *   store.subscribe,
 *   () => store.getSnapshot(),
 *   (snapshot) => computeDerivedValue(snapshot)
 * );
 * ```
 */
export class DerivedState<T, D> {
  private _currentValue: D;

  /**
   * Creates a new DerivedState instance.
   *
   * @param initialValue - The initial derived value
   * @param subscribe - A function to subscribe to parent state changes. Should return an unsubscribe function.
   * @param getParentSnapshot - A function that returns the current parent state snapshot
   * @param updateCallback - A function that computes the derived value from the parent state snapshot
   */
  constructor(
    initialValue: D,
    subscribe: (callback: () => void) => () => void,
    private getParentSnapshot: () => T,
    private updateCallback: (snapshot: Readonly<T>) => D,
  ) {
    this._currentValue = initialValue;
    subscribe(this.update.bind(this));
  }

  /**
   * Gets the current derived value.
   *
   * @returns The current derived value
   */
  public get current(): D {
    return this._currentValue;
  }

  /**
   * Updates the derived value by invoking the update callback with the current parent snapshot.
   * This method is called automatically when the parent state changes.
   *
   * @private
   */
  private update() {
    this._currentValue = this.updateCallback(this.getParentSnapshot());
  }
}
