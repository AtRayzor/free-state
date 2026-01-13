import { describe, it, expect } from "vitest";
import { extractStore, store } from "@free-state/ts-decorators";
import { DefaultStore } from "free-state";

@store
class TestState {
  constructor(
    public firstName: string,
    public lastName: string,
    public age: number,
    public email: string,
  ) {}

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

describe("Store Decorator Tests", () => {
  it("should create a store instance", () => {
    const state = new TestState("Joe", "Skow", 33, "joe.skow@example.com");
    const extractedStore = extractStore(state);
    expect(extractedStore).toBeDefined();
    expect(extractedStore instanceof DefaultStore).toBe(true);
  });
  it("should return correct snapshot", () => {
    const state = new TestState("Joe", "Skow", 33, "joe.skow@example.com");
    const extractedStore = extractStore(state);
    expect(extractedStore).toBeDefined();
    expect(extractedStore?.getSnapshot()).toEqual({
      firstName: "Joe",
      lastName: "Skow",
      age: 33,
      email: "joe.skow@example.com",
    });
  });

  it("should update value with setter", () => {
    const state = new TestState("Joe", "Skow", 33, "joe.skow@example.com");
    state.age = 34;
    const extractedStore = extractStore(state);

    expect(extractedStore?.getSnapshot()).toEqual({
      firstName: "Joe",
      lastName: "Skow",
      age: 34,
      email: "joe.skow@example.com",
    });
  });
});
