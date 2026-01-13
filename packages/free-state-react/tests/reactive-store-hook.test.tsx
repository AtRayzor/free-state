import { describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import {createStore} from "free-state";
import {useStore} from "../lib/reactive-store-hook";

const testStore = createStore({ count: 0 });

function TestComponent() {
  const state = useStore(testStore);

  return (
    <div>
      <button id="increment-btn" onClick={() => state.count++}>
        Increment
      </button>
      <span id="count">{state.count}</span>
    </div>
  );
}

describe("Reactive store Hook Tests", () => {
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
