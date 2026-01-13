import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "free-state";

const listenerCallback = vi.fn();

describe("store", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should invoke callback when value changes", () => {
    const testStore = createStore({ value: 0 });
    testStore.subscribe(listenerCallback);
    const store = testStore.getProxy();
    store.value = 4;
    expect(listenerCallback).toHaveBeenCalledTimes(1);
  });

  it("should not invoke the callback after unsubscribe.", () => {
    const testStore = createStore({ value: 0 });
    const unsubscribe = testStore.subscribe(listenerCallback);
    const store = testStore.getProxy();
    unsubscribe();
    store.value = 5;
    expect(listenerCallback).not.toHaveBeenCalled();
  });

  it("should return the correct snapshot", () => {
    const testStore = createStore({ value: 0 });
    const initialSnapshot = testStore.getProxy();
    expect(initialSnapshot.value).toEqual(0);
    initialSnapshot.value = 5;
    const updatedSnapshot = testStore.getSnapshot();
    expect(Object.is(initialSnapshot, updatedSnapshot)).toBe(false);
    expect(updatedSnapshot.value).toEqual(5);
  });
  it("should invoke callback after transformation", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });
    testStore.subscribe(listenerCallback);
    testStore.transform((state) => ({
      ...state,
      age: 31,
      email: "john.1@example.com",
    }));
    expect(listenerCallback).toHaveBeenCalledTimes(1);
  });
  it("should not invoke callback after transformation after unsubscribe", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });
    const unsubscribe = testStore.subscribe(listenerCallback);
    testStore.transform((state) => ({
      ...state,
      age: 31,
      email: "john.1@example.com",
    }));
    unsubscribe();
    testStore.transform((state) => ({ ...state, name: "Jack" }));
    expect(listenerCallback).toHaveBeenCalledTimes(1);
  });
  it("return correct snapshot after transformation", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });
    testStore.subscribe(listenerCallback);
    testStore.transform((state) => ({
      ...state,
      age: 31,
      email: "john.1@example.com",
    }));
    const snapshot = testStore.getSnapshot();
    expect(snapshot).toEqual({
      name: "John",
      age: 31,
      email: "john.1@example.com",
    });
  });

  it("should correctly initialize derived state", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });
    const derived = testStore.derive((state) => `${state.name}, ${state.age}`);
    expect(derived.current).toBe("John, 30");
  });
  it("should update derived state store updated", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });
    const derived = testStore.derive((state) => `${state.name}, ${state.age}`);
    const snapshot = testStore.getProxy();
    snapshot.age = 31;
    expect(derived.current).toBe("John, 31");
  });
});
