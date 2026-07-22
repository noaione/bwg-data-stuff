// Minimal typed observable value — deliberately not Vue's reactivity system,
// so shared state can be read/written from plain TypeScript code (the
// geoblock injector) without pulling Vue into anything but the settings UI.
export class Store<T> {
  private listeners = new Set<(value: T) => void>();

  constructor(private current: T) {}

  get value(): T {
    return this.current;
  }

  set value(next: T) {
    this.current = next;
    for (const listener of this.listeners) listener(next);
  }

  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
