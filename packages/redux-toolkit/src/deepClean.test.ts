import deepClean from './deepClean';
describe('deepClean', () => {
  // Replaced by "it should clean undefined values and empty objects from the object"
  // it('should clean undefined values from the object', () => {
  //   const obj = {
  //     foo: 'bar',
  //     nested: {
  //       prop1: undefined,
  //       prop2: 'value',
  //     },
  //     undefined: undefined,
  //     nestedUndefined: {
  //       prop1: undefined,
  //       prop2: undefined,
  //       prop3: { prop4: undefined },
  //     },
  //     emptyObject: {},
  //     nestedEmptyObject: {
  //       prop1: {},
  //       prop2: { prop3: {} },
  //     },
  //   };

  //   const cleanedObj = deepClean(obj);

  //   expect(cleanedObj).toEqual({
  //     foo: 'bar',
  //     nested: {
  //       prop2: 'value',
  //     },
  //     emptyObject: {},
  //     nestedEmptyObject: {
  //       prop1: {},
  //       prop2: { prop3: {} },
  //     },
  //   });
  // });

  it('should clean undefined values and empty objects from the object', () => {
    const obj = {
      foo: 'bar',
      nested: {
        prop1: undefined,
        prop2: 'value',
      },
      undefined: undefined,
      nestedUndefined: {
        prop1: undefined,
        prop2: undefined,
        prop3: { prop4: undefined },
      },
      emptyObject: {},
      nestedEmptyObject: {
        prop1: {},
        prop2: { prop3: {} },
      },
    };

    const cleanedObj = deepClean(obj);

    expect(cleanedObj).toEqual({
      foo: 'bar',
      nested: {
        prop2: 'value',
      },
    });
  });
});
