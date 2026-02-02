import { vi, beforeEach, describe, expect, it } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import { createStore } from "free-state";
import {
  useProxy,
  useSnapshot,
  useSnapshotWithSetters,
  useStore,
  useTransform,
} from "../lib/reactive-store-hook";

let testStore = createStore({ count: 0 });



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
  beforeEach(() => {
    testStore = createStore({ count: 0 });
  });

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

describe("useSnapshot", () => {
  beforeEach(() => {
    testStore = createStore({ count: 0 });
  });

  it("should return the correct snapshot.", () => {
    const result = renderHook(() => {
      return useSnapshot(testStore);
    });

    expect(result.result.current.count).toBe(0);
  });

  it("should return the correct snapshot after transformation.", () => {
    const result = renderHook(() => {
      return useSnapshot(testStore);
    });

    act(() => {
      testStore.transform((_) => ({ count: 4 }));
    });

    expect(result.result.current.count).toBe(4);
  });
});

describe("useProxy", () => {
  beforeEach(() => {
    testStore = createStore({ count: 0 });
  });

  it("should return the correct proxy snapshot.", () => {
    const result = renderHook(() => {
      return useProxy(testStore);
    });

    expect(result.result.current.count).toBe(0);
  });

  it("should return the correct proxy snapshot after external update.", () => {
    const result = renderHook(() => {
      return useProxy(testStore);
    });

    act(() => {
      testStore.transform((_) => ({ count: 4 }));
    });

    expect(result.result.current.count).toBe(4);
  });

  it("should return the correct proxy snapshot after proxy value is set.", () => {
    const result = renderHook(() => {
      return useProxy(testStore);
    });
    const proxy = result.result.current;

    act(() => {
      proxy.count = 5;
    });

    expect(result.result.current.count).toBe(5);
  });
});

interface TransformableTestState {
  name?: string;
  email?: string;
  isValid?: boolean;
}

let transformableStore = createStore<TransformableTestState>({});
const mockTransformer = vi.fn();
mockTransformer.mockImplementation((_) => ({
  name: "Jack Black",
  email: "jack.black@example.com",
  isValid: false,
}));

describe("useTransform tests", () => {
  it("should return valid snapshot", () => {
    transformableStore = createStore<TransformableTestState>({
      name: "Jack Black",
      email: "jack.black@example.com",
      isValid: true,
    });

    const rendered = renderHook(() => {
      const [state] = useTransform(transformableStore);
      return state;
    });
    expect(rendered.result.current.name).toBe("Jack Black");
    expect(rendered.result.current.email).toBe("jack.black@example.com");
    expect(rendered.result.current.isValid).toBeTruthy();
  });

  it("should pass the correct snapshot to the transformer.", () => {
    const initial = {
      name: "Jack Black",
      email: "jack.black@example.com",
      isValid: true,
    };
    transformableStore = createStore<TransformableTestState>(initial);
    let passed: TransformableTestState | undefined;

    const rendered = renderHook(() => {
      return useTransform(transformableStore);
    });
    const [_, transformer] = rendered.result.current;

    act(() => {
      transformer((arg) => {
        passed = { ...arg };
        return { ...arg, isValid: false };
      });
    });

    expect(passed?.name).toBe("Jack Black");
    expect(passed?.email).toBe("jack.black@example.com");
    expect(passed?.isValid).toBeTruthy();
  });
});

describe("userSnapshotWithSetters", () => {
  beforeEach(async () => {

  })

  it("should return valid snapshot", () => {
    const store = createStore({
      name: "Jack Black",
      email: "jack.black@example.com",
      isValid: true,
    });

    const hookResult = renderHook(() => useSnapshotWithSetters(store));
    const [snapshot] = hookResult.result.current;
    expect(snapshot).toStrictEqual({
      name: "Jack Black",
      email: "jack.black@example.com",
      isValid: true,
    });
  });

  it("should update snapshot when setter is invoked", () => {
    const store = createStore({
      name: "Jack Black",
      email: "jack.black@example.com",
      isValid: true,
    });

    const hookResult = renderHook(() => useSnapshotWithSetters(store));
    const [_, { setIsValid }] = hookResult.result.current;

    act(() => {
      setIsValid(false);
    });

    const [snapshot] = hookResult.result.current;

    expect(snapshot).toStrictEqual({
      name: "Jack Black",
      email: "jack.black@example.com",
      isValid: false,
    });
  });

  it("should trigger rerender when setter is called", () => {
    const store = createStore({
      name: "Jack Black",
      email: "jack.black@example.com",
      isValid: true,
    });

    const TestComponent = () => {
      const [{ name }, { setName }] = useSnapshotWithSetters(store);

      return (
        <div>
          <span id="name">{name}</span>
          <button id="changeName" onClick={() => setName("Jim")}>
            Change name
          </button>
        </div>
      );
    };

    const renderResult = render(<TestComponent />);
    const  btnElement = renderResult.baseElement.querySelector("#changeName") as HTMLButtonElement;

    act(() => {
      btnElement.click();
    });

    const nameElement =renderResult.baseElement.querySelector("#name");

    expect(nameElement?.innerHTML).toBe("Jim");
  });
});
