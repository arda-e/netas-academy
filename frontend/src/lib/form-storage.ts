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

  save<T>(data: T, options?: { excludeFields?: (keyof T)[] }): void {
    try {
      let payload: unknown = data;
      if (options?.excludeFields && options.excludeFields.length > 0) {
        const copy = { ...data };
        for (const field of options.excludeFields) {
          delete copy[field];
        }
        payload = copy;
      }
      sessionStorage.setItem(this.#key, JSON.stringify(payload));
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
