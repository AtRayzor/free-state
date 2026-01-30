import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "../lib/reactive-store";

const listenerCallback = vi.fn();

describe("Store.subscribe", () => {
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
});

describe("getSnapshot", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return the correct snapshot", () => {
    const testStore = createStore({ value: 0 });
    const snapshot = testStore.getSnapshot();
    expect(snapshot.value).toBe(0);
  });

  it("should not modify snapshot after update", () => {
    const testStore = createStore({ value: 0 });
    const snapshot = testStore.getSnapshot();
    testStore.transform(() => ({ value: 5 }));
    console.log("snapshot.value = ", snapshot.value);
    expect(snapshot.value).toBe(0);
  });
});

describe("getProxy", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return the correct proxy object", () => {
    const testStore = createStore({ value: 0 });
    const snapshot = testStore.getProxy();
    expect(snapshot.value).toBe(0);
  });

  it("should modify snapshot after update", () => {
    const testStore = createStore({ value: 0 });
    const proxy = testStore.getProxy();
    proxy.value = 5;

    const snapshot = testStore.getSnapshot();

    expect(proxy.value).toBe(5);
    expect(snapshot.value).toBe(5);
  });
});

describe("getReadonlyProxy", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return the correct proxy object", () => {
    const testStore = createStore({ value: 0 });
    const readonlyProxy = testStore.getReadonlyProxy();
    expect(readonlyProxy.value).toBe(0);
  });

  it("should modify value after update", () => {
    const testStore = createStore({ value: 0 });
    const readOnlyProxy = testStore.getReadonlyProxy();
    testStore.transform((_) => ({ value: 5 }));

    expect(readOnlyProxy.value).toBe(5);
  });

  it("should throw if setter called", () => {
    const testStore = createStore({ value: 0 });
    const readonlyProxy = testStore.getReadonlyProxy();

    const action = () => {
      // @ts-expect-error
      readonlyProxy.value = 5;
    };

    expect(action).toThrow();
  });
});

describe("transform", () => {
  afterEach(() => {
    vi.resetAllMocks();
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
});

describe("update", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should notify subscribers after update", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });

    testStore.subscribe(listenerCallback);
    testStore.update({
      name: "John",
      age: 31,
      email: "john@example.com",
    });

    expect(listenerCallback).toHaveBeenCalledTimes(1);
  });


  it("should notify subscribers when objects are equal (shallow)", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });

    testStore.subscribe(listenerCallback);
    testStore.update({
      name: "John",
      age: 30,
      email: "john@example.com",
    });

    expect(listenerCallback).toHaveBeenCalledTimes(0);
  });

  it("should correctly update snapshot", () => {
    const testStore = createStore({
      name: "John",
      age: 30,
      email: "john@example.com",
    });

    testStore.subscribe(listenerCallback);
    testStore.update({
      name: "John",
      age: 31,
      email: "john@example.com",
    });
    const snapshot = testStore.getSnapshot();

    expect(snapshot).toStrictEqual({
      name: "John",
      age: 31,
      email: "john@example.com",
    });
  });
});

describe("derive", () => {
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
