# free-state

A tiny, Proxy-backed reactive store for TypeScript classes, plus a React hook powered by `useSyncExternalStore`.

This package exports:

- `ReactiveStore` — a class decorator / higher-order class that makes a class instance behave like a React-compatible external store
- `useReactiveStore` — a React hook that reads the store via `useSyncExternalStore`
- `ReactiveStoreType<T>` — the minimal external-store interface (`subscribe` + `getSnapshot`)

> Status: **experimental** (`0.0.1-experimental`). APIs and behavior may change.

## Installation

```bash
pnpm add reactive-store
# or
npm i reactive-store
# or
yarn add reactive-store
```

### Peer dependencies

This library expects these to be provided by your app:

- `react`
- `react-dom`
- `tslib`

## The core idea

`ReactiveStore` wraps a class instance in a `Proxy`. Any *property assignment* on the instance triggers:

1. a new **snapshot** object to be created (a shallow copy of the instance’s enumerable props)
2. all subscribers to be notified

React reads that snapshot via `getSnapshot()` and re-renders subscribers via `useSyncExternalStore`.

## API

### `ReactiveStoreType<T>`

Minimal interface used by React external store integrations:

- `subscribe(callback: () => void): () => void`
- `getSnapshot(): T`

### `ReactiveStore(ctor)`

A class decorator / higher-order class.

- Input: a class constructor
- Output: a new class that extends your class and implements `ReactiveStoreType<any>`

You can use it either as a decorator (if you have TS decorators enabled), or as a wrapper function.

### `useReactiveStore(store)`

A React hook:

```ts
useSyncExternalStore(store.subscribe, store.getSnapshot)
```

It returns the current snapshot (the object returned by `getSnapshot()`).

## Usage (vanilla / TypeScript)

### Option A: wrapper function (no decorators required)

```ts
import { ReactiveStore } from "reactive-store";

class Counter {
  count = 0;

  inc() {
    this.count += 1;
  }
}

const ReactiveCounter = ReactiveStore(Counter);
const counter = new ReactiveCounter();

const unsubscribe = counter.subscribe(() => {
  console.log("count =", counter.getSnapshot().count);
});

counter.inc();
counter.inc();

unsubscribe();
```

### Option B: decorator syntax (`@ReactiveStore`)

If your project supports decorators, you can write:

```ts
import { ReactiveStore } from "reactive-store";

@ReactiveStore
class Counter {
  count = 0;

  inc() {
    this.count += 1;
  }
}

const counter = new Counter();
counter.subscribe(() => console.log(counter.getSnapshot().count));
counter.inc();
```

> Note: decorator support depends on your TypeScript/Babel setup.

## Usage with React

`useReactiveStore` gives you the *snapshot* for rendering. Call methods on the **store instance**, not the snapshot.

```tsx
import * as React from "react";
import { ReactiveStore, useReactiveStore } from "reactive-store";

class Counter {
  count = 0;
  inc() {
    this.count += 1;
  }
  dec() {
    this.count -= 1;
  }
}

const ReactiveCounter = ReactiveStore(Counter);
const counter = new ReactiveCounter();

export function CounterView() {
  const state = useReactiveStore(counter);

  return (
    <div>
      <div>Count: {state.count}</div>
      <button onClick={() => counter.dec()}>-</button>
      <button onClick={() => counter.inc()}>+</button>
    </div>
  );
}
```

## Caveats / current behavior

This README describes the behavior of the current implementation in `src/lib/reactive-store.ts`.

- **Snapshots are shallow.** They’re created via `{ ...instance }`, so only enumerable *own* properties are copied.
- **Methods won’t appear on the snapshot.** Class methods live on the prototype, so they’re not part of `{ ...instance }`.
  - In React, render from the snapshot but invoke actions on the store instance.
- **Updates are triggered by assignments.** The notification happens in the `Proxy` `set` trap.
  - If you mutate nested objects without reassigning, you may not get an update.
- **Instances are proxied.** `ReactiveStore` returns a `Proxy` from the constructor, which can be surprising for some meta-programming patterns.

## Contributing / local development

Scripts (see `package.json`):

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## License

MIT-0. See `LICENSE.txt`.

