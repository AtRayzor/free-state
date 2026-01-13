import {useObserveEvent} from "../lib/event-hooks";
import {afterEach, describe, expect, it, vi} from "vitest";
import {renderHook} from "@testing-library/react";
import {createEvent} from "free-state";

interface TestEvent1 {
  prop1: string;
  prop2: number;
}

const mockObserver = vi.fn();
const event1Subject = (input: string): TestEvent1 => ({
  prop1: input,
  prop2: input.length,
});

const expectedTestEvent1: TestEvent1 = {
  prop1: "test",
  prop2: 4,
}

describe("Event hooks tests", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should invoke observer callback", () => {
    const eventSubject = createEvent(event1Subject);
    renderHook(() => useObserveEvent(eventSubject, mockObserver));
    eventSubject.invoke("test");

    expect(mockObserver).toHaveBeenCalledWith(expectedTestEvent1);
  });
});
