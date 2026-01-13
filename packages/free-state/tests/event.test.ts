import { createEvent } from "free-state";
import { describe, vi, it, beforeEach, expect } from "vitest";

interface TestEvent1 {
  prop1: string;
  prop2: number;
}

interface TestEvent2 {
  prop: string;
  prop2: number;
  prop3: boolean;
}


const observer = vi.fn();
const observer2 = vi.fn();

describe("Event creation and invocation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should invoke attached observer", () => {
    const event1 = createEvent(
        (text: string): TestEvent1 => ({ prop1: text, prop2: text.length }),
    );
    event1.attach(observer);
    event1.invoke("test");
    expect(observer).toHaveBeenCalled();
  });
  it("should not invoke observer if not attached", () => {
    const event1 = createEvent(
        (text: string): TestEvent1 => ({ prop1: text, prop2: text.length }),
    );
    event1.invoke("test");
    expect(observer).not.toHaveBeenCalled();
  });
  it("should not invoke observer after detached", () => {
    const event1 = createEvent(
        (text: string): TestEvent1 => ({ prop1: text, prop2: text.length }),
    );
    event1.attach(observer);
    event1.invoke("test1");
    event1.detach(observer);
    event1.invoke("test2");
    expect(observer).toHaveBeenCalledTimes(1);
  });
  it("should invoke multiple observers", () => {
    const event1 = createEvent(
        (text: string): TestEvent1 => ({ prop1: text, prop2: text.length }),
    );
    event1.attach(observer);
    event1.attach(observer2);
    event1.invoke("test");
    expect(observer).toHaveBeenCalled();
    expect(observer2).toHaveBeenCalled();
  });
  it("should invoke with correct event data", () => {
    const event1 = createEvent(
        (text: string): TestEvent1 => ({ prop1: text, prop2: text.length }),
    );
    event1.attach(observer);
    event1.invoke("test");
    expect(observer).toHaveBeenCalledWith({ prop1: "test", prop2: 4 });
  });
});
