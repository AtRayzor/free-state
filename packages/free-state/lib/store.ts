import {DerivedState} from "./derived";

/**
 * A reactive state container.
 *
 * This store exposes two "views" of the same underlying state:
 * - A **mutable proxy** (`getProxy`) that can be assigned to, triggering updates and notifications.
 * - A **readonly snapshot** (`getSnapshot`) that throws on mutation attempts, suitable for consumers.
 *
 * You can also:
 * - Subscribe to updates (`subscribe`)
 * - Apply batched updates (`transform`)
 * - Create derived state (`derive`) that recomputes when the store changes
 *
 * @typeParam T - The shape of the state object held by the store.
 */
export interface Store<T extends object> {
    /**
     * Subscribes a callback to be invoked any time the store updates.
     *
     * @param callback - Function called after every successful state update.
     * @returns A cleanup function that unsubscribes the callback.
     */
    subscribe(callback: () => void): () => void;

    /**
     * Returns a mutable proxy object that represents the current state.
     *
     * Assigning to any property of this proxy will create a new internal snapshot
     * and notify subscribers.
     *
     * @returns A mutable proxy of the state.
     */
    getProxy(): T;

    /**
     * Returns a readonly proxy (snapshot) of the current state.
     *
     * Any attempts to assign to properties on this object will throw.
     *
     * @returns A readonly proxy of the current state.
     */
    getSnapshot(): Readonly<T>;

    /**
     * Applies a transformation to the current state in a single update.
     *
     * This is useful for updating multiple fields at once without triggering
     * multiple notifications.
     *
     * @param transformer - Function that receives the current readonly state and returns the new state.
     */
    transform(transformer: (state: Readonly<T>) => Readonly<T>): void;

    /**
     * Creates derived state computed from this store.
     *
     * The derived state's value is initially computed from the current snapshot,
     * and will be recomputed when this store changes.
     *
     * @typeParam U - The derived value type.
     * @param transformer - Function that maps the current readonly state to a derived value.
     * @returns A `DerivedState` instance bound to this store.
     */
    derive<U>(transformer: (state: Readonly<T>) => U): DerivedState<T, U>;
}