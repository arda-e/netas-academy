import { z } from 'zod';

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function boolFromEnv(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === '') {
      return defaultValue;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    if (typeof value === 'string') {
      return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
    }

    return value;
  }, z.boolean());
}

export function intFromEnv(defaultValue: number) {
  return z.preprocess((value) => {
    if (value === undefined || value === '') {
      return defaultValue;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return value;
  }, z.number().int());
}

export function urlOrEmpty() {
  return z.string().refine((value) => value === '' || isValidUrl(value), {
    message: 'must be a valid URL or empty',
  });
}

export function toAllowedSource(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`).origin;
  } catch {
    return null;
  }
}

