import { describe, expect, it } from "vitest";
import { ReactiveStore, useReactiveStore } from "reactive-storage";
import { act, render } from "@testing-library/react";

@ReactiveStore
class TestState {
  constructor(public count: number = 0) {}
}

const testState = new TestState();

function TestComponent() {
  const state = useReactiveStore(testState);

  return (
    <div>
      <button id="increment-btn" onClick={() => state.count++}>
        Increment
      </button>
      <span id="count">{state.count}</span>
    </div>
  );
}

describe("Reactive Store Hook Tests", () => {
  it("should update the ui when count changes", async () => {
    render(<TestComponent />, {
      reactStrictMode: true,
    });

    const incrementBtn = document.getElementById("increment-btn");
    let countSpan = document.getElementById("count");

    expect(countSpan?.textContent).toBe("0");

    act(() => {
      incrementBtn?.click();
    });

    countSpan = document.getElementById("count");
    expect(countSpan?.textContent).toBe("1");
  });
});
