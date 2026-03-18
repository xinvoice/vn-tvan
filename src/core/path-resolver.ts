import { MappingError } from './types';

/**
 * Resolves a dot-notation path against an object.
 * Example: resolvePath({ a: { b: 42 } }, "a.b") → 42
 * Returns undefined for missing paths (no throw unless strict).
 */
export function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Like resolvePath but throws MappingError if value is undefined/null in strict mode.
 */
export function resolveRequired(obj: unknown, path: string, xmlTarget: string): unknown {
  const value = resolvePath(obj, path);
  if (value === undefined || value === null) {
    throw new MappingError('Required field is missing or null', path, xmlTarget);
  }
  return value;
}
