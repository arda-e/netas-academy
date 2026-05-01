/**
 * Thin wrapper around sessionStorage for persisting form state across
 * page navigations.  All methods silently ignore quota / access errors
 * so callers never need try/catch.
 */
export class FormStorage {
  #key: string;

  constructor(key: string) {
    this.#key = key;
  }

  save<T>(data: T): void {
    try {
      sessionStorage.setItem(this.#key, JSON.stringify(data));
    } catch {
      /* ignore quota / access errors */
    }
  }

  load<T>(): T | null {
    try {
      const raw = sessionStorage.getItem(this.#key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* ignore parse errors */
    }
    return null;
  }

  clear(): void {
    try {
      sessionStorage.removeItem(this.#key);
    } catch {
      /* ignore quota / access errors */
    }
  }
}
