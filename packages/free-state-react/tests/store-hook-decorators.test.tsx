import { vi, describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../lib/reactive-store-hook";
import { act, render } from "@testing-library/react";
import { store } from "@free-state/ts-decorators";

@store
class TestClass {
  constructor(
    public firstName: string,
    public lastName: string,
    public age: number,
  ) {}
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

let classInstance: TestClass;

function TestComponent() {
  useStore(classInstance);

  return <div>{classInstance.fullName}</div>;
}

describe("Store hook with store decorator", () => {
  beforeEach(() => {
    classInstance = new TestClass("John", "Doe", 30);
  });

  it("should render full name", () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText("John Doe")).toBeInTheDocument();
  });

  it("should update full name when age changes", () => {
    const { getByText } = render(<TestComponent />);

    act(() => {
      classInstance.lastName = "Smith";
    });

    expect(getByText("John Smith")).toBeInTheDocument();
  });
});
