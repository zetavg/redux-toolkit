import counterSlice, { CounterState } from './slice';

describe('reducer', () => {
  const { reducer } = counterSlice;

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({
      value: 0,
    });
  });

  describe('action handling', () => {
    describe('increment', () => {
      it('should increase counter value by 1', () => {
        const previousState: CounterState = { value: 1 };

        expect(
          reducer(previousState, counterSlice.actions.increment()),
        ).toEqual({
          value: 2,
        });
      });
    });

    describe('decrement', () => {
      it('should decrease counter value by 1', () => {
        const previousState: CounterState = { value: 1 };

        expect(
          reducer(previousState, counterSlice.actions.decrement()),
        ).toEqual({
          value: 0,
        });
      });
    });

    describe('incrementByAmount', () => {
      it('should increase counter value by amount', () => {
        const previousState: CounterState = { value: 2 };

        expect(
          reducer(previousState, counterSlice.actions.incrementByAmount(5)),
        ).toEqual({
          value: 7,
        });
      });
    });
  });
});

describe('selectors', () => {
  const selectors = counterSlice.getSelectors();

  describe('value', () => {
    it('returns the value of the counter', () => {
      expect(selectors.value({ value: 123 })).toEqual(123);
    });
  });
});
