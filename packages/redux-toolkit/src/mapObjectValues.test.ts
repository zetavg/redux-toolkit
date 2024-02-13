import mapObjectValues from './mapObjectValues';

describe('mapObjectValues', () => {
  it('should map object values correctly', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    const result = mapObjectValues(obj, (v) => `${v * 2}`);

    expect(result).toEqual({
      a: '2',
      b: '4',
      c: '6',
    });

    // Test that the result is typed correctly
    result.a = 'str';
  });
});
