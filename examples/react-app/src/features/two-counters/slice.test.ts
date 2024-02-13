import twoCountersSlice from './slice';

describe('reducer', () => {
  const { reducer } = twoCountersSlice;

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(
      twoCountersSlice.getInitialState(),
    );
  });

  describe('sub-action handling', () => {
    describe('counterOne', () => {
      describe('increment', () => {
        it('should increase the counter value for the first counter by 1', () => {
          expect(
            reducer(
              {
                counterOne: {
                  value: 1,
                },
                counterTwo: {
                  value: 1,
                },
              },
              twoCountersSlice.subActions.counterOne.increment(),
            ),
          ).toEqual({
            counterOne: {
              value: 2,
            },
            counterTwo: {
              value: 1,
            },
          });
        });
      });
    });

    describe('counterTwo', () => {
      describe('increment', () => {
        it('should increase the counter value for the second counter by 1', () => {
          expect(
            reducer(
              {
                counterOne: {
                  value: 1,
                },
                counterTwo: {
                  value: 1,
                },
              },
              twoCountersSlice.subActions.counterTwo.increment(),
            ),
          ).toEqual({
            counterOne: {
              value: 1,
            },
            counterTwo: {
              value: 2,
            },
          });
        });
      });
    });
  });
});

describe('sub-selectors', () => {
  const subSelectors = twoCountersSlice.getSubSelectors();

  describe('counterOne', () => {
    describe('value', () => {
      it('should return the value of the first counter', () => {
        expect(
          subSelectors.counterOne.value({
            counterOne: {
              value: 123,
            },
            counterTwo: {
              value: 456,
            },
          }),
        ).toEqual(123);

        expect(
          subSelectors.counterOne.value({
            counterOne: {
              value: 456,
            },
            counterTwo: {
              value: 789,
            },
          }),
        ).toEqual(456);
      });
    });
  });

  describe('counterTwo', () => {
    describe('value', () => {
      it('should return the value of the first counter', () => {
        expect(
          subSelectors.counterTwo.value({
            counterOne: {
              value: 123,
            },
            counterTwo: {
              value: 456,
            },
          }),
        ).toEqual(456);

        expect(
          subSelectors.counterTwo.value({
            counterOne: {
              value: 456,
            },
            counterTwo: {
              value: 789,
            },
          }),
        ).toEqual(789);
      });
    });
  });
});
