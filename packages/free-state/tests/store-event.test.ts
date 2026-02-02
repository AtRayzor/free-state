import { createStore, EventSubject, Store } from "free-state";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

interface TestState {
  count: number;
}

let testStore: Store<TestState>;
const mockObserver = vi.fn();

describe("createEvent", () => {
  beforeEach(() => {
    testStore = createStore<TestState>({ count: 0 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return event subject", () => {
    const event = testStore.createEvent();
    expect(event).toBeInstanceOf(EventSubject);
  });

  it("should invoke event when state is updated", () => {
    const event = testStore.createEvent();
    event.attach(mockObserver);
    testStore.update({ count: 2 });

    expect(mockObserver).toHaveBeenCalledTimes(1);
  });

  it("should invoke observer only when predicate is true", () => {
    const event = testStore.createEvent(({ count }) => count % 2 === 0);
    event.attach(mockObserver);
    testStore.update({ count: 2 });
    testStore.update({ count: 1 });

    expect(mockObserver).toHaveBeenCalledTimes(1);
  });
});
