export class DerivedState<T, D> {
  private _currentValue: D;

  constructor(
    initialValue: D,
    subscribe: (callback: () => void) => () => void,
    private getParentSnapshot: () => T,
    private updateCallback: (snapshot: Readonly<T>) => D,
  ) {
    this._currentValue = initialValue;
    subscribe(this.update.bind(this));
  }

  public get current(): D {
    return this._currentValue;
  }

  private update() {
    this._currentValue = this.updateCallback(this.getParentSnapshot());
  }
}
