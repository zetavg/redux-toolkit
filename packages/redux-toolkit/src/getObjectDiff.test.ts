import { DELETED, getObjectDiff, NO_DIFF } from './getObjDiff';

describe('getObjectDiff', () => {
  it('should return NO_DIFF for identical objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = obj1;
    expect(getObjectDiff(obj1, obj2)).toBe(NO_DIFF);
  });

  it('should return a diff object for different objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 2, b: 2 };
    expect(getObjectDiff(obj1, obj2)).toEqual({ a: 2 });
  });

  it('should handle nested objects', () => {
    const obj1 = { a: 1, b: { c: 3 } };
    const obj2 = { ...obj1, b: { ...obj1.b, c: 4 } };
    expect(getObjectDiff(obj1, obj2)).toEqual({ b: { c: 4 } });
  });

  it('should handle arrays', () => {
    const obj1 = { a: 1, b: [1, 2, 3] };
    const obj2 = { a: 1, b: [1, 2, 4] };
    expect(getObjectDiff(obj1, obj2)).toEqual({ b: [1, 2, 4] });
  });

  it('should handle new properties', () => {
    const obj1 = { a: 1 };
    const obj2 = { ...obj1, b: 2 };
    expect(getObjectDiff(obj1, obj2)).toEqual({ b: 2 });
  });

  it('should handle removed properties', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2: Record<string, unknown> = { ...obj1 };
    delete obj2.b;
    expect(getObjectDiff(obj1, obj2)).toEqual({ b: DELETED });
  });

  it('should handle nested removed properties', () => {
    const obj1 = { a: 1, b: { c: 3 } };
    const obj2 = { a: 1, b: {} };

    const result = getObjectDiff(obj1, obj2);
    expect(result).toEqual({ b: { c: DELETED } });
    expect(Object.keys((result as typeof obj1).b)).toEqual(['c']);
  });
});
