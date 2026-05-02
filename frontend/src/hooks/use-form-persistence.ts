"use client";

import { useCallback, useMemo } from "react";

import { FormStorage } from "@/lib/form-storage";

/**
 * React hook that wraps the FormStorage load/save/clear lifecycle.
 *
 * Automatically filters out `sensitiveFields` when persisting so callers
 * don't need to remember to pass `excludeFields` manually.
 */
export function useFormPersistence<T extends Record<string, unknown>>(
  storageKey: string,
  options?: { sensitiveFields?: (keyof T)[] }
) {
  const storage = useMemo(() => new FormStorage(storageKey), [storageKey]);

  const load = useCallback(() => storage.load<T>(), [storage]);
  const clear = useCallback(() => storage.clear(), [storage]);

  const save = useCallback(
    (data: T) => {
      storage.save(data, {
        excludeFields: options?.sensitiveFields,
      });
    },
    [storage, options?.sensitiveFields]
  );

  return { load, save, clear };
}
