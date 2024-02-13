import { isObject } from './utils';

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true);
  });
});
