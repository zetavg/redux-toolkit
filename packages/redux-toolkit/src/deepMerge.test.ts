import deepMerge from './deepMerge';
import { DELETED } from './getObjDiff';

describe('deepMerge', () => {
  it('should merge two objects deeply', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };

    const source = {
      b: {
        d: {
          f: 4,
        },
        g: 5,
      },
      h: 6,
    };

    const expected = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
          f: 4,
        },
        g: 5,
      },
      h: 6,
    };

    const result = deepMerge(target, source);

    expect(result).toEqual(expected);
  });

  it('should not mutate the target object', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
      },
    };

    const source = {
      b: {
        d: 3,
      },
    };

    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } });
    expect(target).toEqual({ a: 1, b: { c: 2 } });
  });

  it('should return the target object if the source is empty', () => {
    const target = { a: 1 };
    const source = {};
    const result = deepMerge(target, source);
    expect(target === result).toBe(true);
  });

  it('should keep unchanged parts references unchanged', () => {
    const target = {
      a: {
        a1: 1,
      },
      b: {
        b1: 2,
      },
    };

    const source = {
      b: {
        b2: 3,
      },
    };

    const result = deepMerge(target, source);
    expect(result.a === target.a).toBe(true);
  });

  it('can treat null values correctly', () => {
    const target = {
      a: undefined as null | number | undefined,
    };

    const source = {
      a: null as null | number,
    };

    const result = deepMerge(target, source);
    expect(result.a).toBe(null);
  });

  it('should skip undefined values', () => {
    const target = {
      a: { b: { c: 1 } },
    };

    const source = {
      a: { b: undefined as unknown },
    };

    const result = deepMerge(target, source);
    expect(result.a.b).toEqual({ c: 1 });
  });

  it('should work well with proxy objects', () => {
    const target = {
      a: { b: { c: 1 } },
    };

    const source = {
      a: { b: { d: 2 } },
    };

    const targetProxy = new Proxy(target, {});
    const sourceProxy = new Proxy(source, {});

    const result = deepMerge(targetProxy, sourceProxy);
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
  });

  it('should persist DELETED symbol if preserveDeletedSymbol is set to true', () => {
    const target = {
      a: { b: 123 },
    };

    const source = {
      a: { b: DELETED },
    };

    const result = deepMerge(target, source, { preserveDeletedSymbol: true });
    expect(result.a.b).toBe(DELETED);
  });
});
