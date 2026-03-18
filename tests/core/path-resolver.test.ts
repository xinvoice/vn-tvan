import { describe, it, expect } from 'vitest';
import { resolvePath, resolveRequired } from '../../src/core/path-resolver';
import { MappingError } from '../../src/core/types';

describe('resolvePath', () => {
  it('resolves simple key', () => {
    expect(resolvePath({ a: 1 }, 'a')).toBe(1);
  });

  it('resolves nested path', () => {
    expect(resolvePath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
  });

  it('returns undefined for missing key', () => {
    expect(resolvePath({ a: 1 }, 'b')).toBeUndefined();
  });

  it('returns undefined for missing nested key', () => {
    expect(resolvePath({ a: {} }, 'a.b.c')).toBeUndefined();
  });

  it('returns null for null value', () => {
    expect(resolvePath({ a: null }, 'a')).toBeNull();
  });

  it('returns undefined when intermediate is not an object', () => {
    expect(resolvePath({ a: 42 }, 'a.b')).toBeUndefined();
  });
});

describe('resolveRequired', () => {
  it('returns value when present', () => {
    expect(resolveRequired({ a: 'x' }, 'a', 'Tag')).toBe('x');
  });

  it('throws MappingError when value is undefined', () => {
    expect(() => resolveRequired({}, 'a', 'Tag')).toThrow(MappingError);
  });

  it('throws MappingError when value is null', () => {
    expect(() => resolveRequired({ a: null }, 'a', 'Tag')).toThrow(MappingError);
  });
});
