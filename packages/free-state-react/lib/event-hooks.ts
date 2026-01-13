import { EventSubject } from "free-state";
import { useEffect } from "react";

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
