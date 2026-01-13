import { EventSubject } from "free-state";
import { useEffect } from "react";

/**
 * A React hook that observes events from an EventSubject.
 *
 * This hook automatically attaches an observer to the event subject when the component mounts
 * and detaches it when the component unmounts or when the subject/observer changes.
 *
 * @template E - The type of event being observed
 * @param {EventSubject<any, E>} subject - The event subject to observe. Must be an instance of EventSubject decorated with @event.
 * @param {(event: E) => void | Promise<void>} observer - The callback function to invoke when an event is emitted. Can be synchronous or asynchronous.
 * @throws {Error} Throws an error if the subject is not an instance of EventSubject
 *
 * @example
 * ```tsx
 * const myEventSubject = new EventSubject<string>();
 *
 * function MyComponent() {
 *   useObserveEvent(myEventSubject, (event) => {
 *     console.log('Event received:', event);
 *   });
 *
 *   return <div>Observing events...</div>;
 * }
 * ```
 */
export function useObserveEvent<E>(
  subject: EventSubject<any, E>,
  observer: (event: E) => void | Promise<void>,
) {
  useEffect(() => {
    if (!subject || !observer) return;
    const sub = subject as any;
    if (!(sub instanceof EventSubject))
      throw Error("Observers should be decorated with the @event decorator");
    sub.attach(observer);
    return () => sub.detach(observer);
  }, [subject, observer]);
}
