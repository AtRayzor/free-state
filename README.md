# Free State

A lightweight, flexible reactive state management library for TypeScript and React applications.

## 📦 Packages

This monorepo contains three packages:

### [`free-state`](./packages/free-state)

The core reactive state management library. Provides reactive stores, event systems, and derived state.

**Key Features:**
- 🎯 **Simple API**: Easy-to-use reactive stores with minimal boilerplate
- 🔄 **Reactive Updates**: Automatic subscriber notifications on state changes
- 📸 **Immutable Snapshots**: Safe, readonly views of state
- ⚡ **Derived State**: Computed values that automatically update when dependencies change
- 🎪 **Event System**: Built-in event emitter for decoupled communication
- 🪶 **Lightweight**: Minimal dependencies and small bundle size

### [`free-state-react`](./packages/free-state-react)

React hooks and integrations for `free-state`.

**Key Features:**
- ⚛️ **React Integration**: Seamless integration with React's concurrent features
- 🪝 **Custom Hooks**: `useStore` hook for reactive state in components
- 🎯 **TypeScript Support**: Full type safety for your React components
- 🔄 **Auto Re-renders**: Components automatically re-render when state changes

### [`@free-state/ts-decorators`](./packages/ts-decorators)

TypeScript decorators for class-based reactive state management.

**Key Features:**
- 🎨 **Decorator Syntax**: Transform classes into reactive stores with `@store`
- 📦 **Class-Based API**: Object-oriented approach to state management
- 🔗 **Store Extraction**: Utilities to access underlying store instances

## 🚀 Quick Start

### Installation

```bash
# Core library
npm install free-state

# React hooks
npm install free-state free-state-react

# TypeScript decorators
npm install free-state @free-state/ts-decorators
```

### Basic Usage

#### Core Store

```typescript
import { createStore } from 'free-state';

// Create a reactive store
const counterStore = createStore({ count: 0 });

// Subscribe to changes
const unsubscribe = counterStore.subscribe(() => {
  console.log('Count:', counterStore.getSnapshot().count);
});

// Update state
const proxy = counterStore.getProxy();
proxy.count = 1; // Logs: "Count: 1"

// Batch updates
counterStore.transform(state => ({ ...state, count: state.count + 5 }));

// Derived state
const doubled = counterStore.derive(state => state.count * 2);
console.log(doubled.getValue()); // 12
```

#### React Hook

```typescript
import { createStore } from 'free-state';
import { useStore } from 'free-state-react';

const appStore = createStore({ count: 0 });

function Counter() {
  const state = useStore(appStore);
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => state.count++}>Increment</button>
    </div>
  );
}
```

#### TypeScript Decorators

```typescript
import { store } from '@free-state/ts-decorators';
import { useStore } from 'free-state-react';

@store
class CounterState {
  count = 0;
}

const counterState = new CounterState();

function Counter() {
  useStore(counterState);
  
  return (
    <div>
      <p>Count: {counterState.count}</p>
      <button onClick={() => counterState.count++}>Increment</button>
    </div>
  );
}
```

## 🏗️ Development

This project uses pnpm workspaces for monorepo management.

### Prerequisites

- Node.js 18+
- pnpm 10.27.0+

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Development mode (watch)
pnpm dev
```

### Project Structure

```
state-lib/
├── packages/
│   ├── free-state/          # Core reactive state library
│   ├── free-state-react/    # React hooks and integrations
│   └── ts-decorators/       # TypeScript decorator utilities
├── package.json             # Root workspace configuration
└── tsconfig.json           # Shared TypeScript config
```

## 📝 License

MIT No Attribution (MIT-0) - See [LICENSE.txt](./LICENSE.txt) for details.

## 👤 Author

**Timothy Ray**

- GitHub: [@AtRayzor](https://github.com/AtRayzor)
- Repository: [free-state](https://github.com/AtRayzor/free-state)

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on the [GitHub issue tracker](https://github.com/AtRayzor/free-state/issues).

## 🤝 Contributing

Contributions are welcome! This project is in active development (currently in alpha).

---

Built with ❤️ using TypeScript and React

