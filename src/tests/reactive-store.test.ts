import { describe, vi, it, expect, afterEach } from "vitest";
import { ReactiveStore } from "reactive-storage";
import type { ReactiveStoreType } from "reactive-storage";

@ReactiveStore
class TestStore {
  public value: number;

  constructor(value: number) {
    this.value = value;
  }
}

const listenerCallback = vi.fn();

describe("ReactiveStore", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should invoke callback when value changes", () => {
    const testStore = new TestStore(
      0,
    ) as unknown as ReactiveStoreType<TestStore>;
    testStore.subscribe(listenerCallback);
    const store = testStore.getSnapshot();

    store.value = 4;
    expect(listenerCallback).toHaveBeenCalledTimes(1);
  });

  it("should not invoke the callback after unsubscribe.", () => {
    const testStore = new TestStore(
      0,
    ) as unknown as ReactiveStoreType<TestStore>;
    const unsubscribe = testStore.subscribe(listenerCallback);
    const store = testStore.getSnapshot();
    unsubscribe();
    store.value = 5;
    expect(listenerCallback).not.toHaveBeenCalled();
  });

  it("should return the correct snapshot", () => {
    const testStore = new TestStore(0);
    const getSnapshot = (testStore as unknown as ReactiveStoreType<TestStore>)
      .getSnapshot;
    const initialSnapshot = getSnapshot();
    expect(initialSnapshot.value).toEqual(0);
    initialSnapshot.value = 5;
    const updatedSnapshot = getSnapshot();
    expect(Object.is(initialSnapshot, updatedSnapshot)).toBe(false);
    expect(updatedSnapshot.value).toEqual(5);
  });
});
