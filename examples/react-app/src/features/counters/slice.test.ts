import counterSlice from '../counter/slice';

import countersSlice, { CountersState } from './slice';

describe('reducer', () => {
  const { reducer } = countersSlice;

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(
      countersSlice.getInitialState(),
    );
  });

  describe('action handling', () => {
    describe('initialize', () => {
      it('creates a counter if there are no counters', () => {
        const initializedState = reducer(
          countersSlice.getInitialState(),
          countersSlice.actions.initialize(),
        );
        expect(initializedState.currentCounterId).toBeTruthy();
        expect(
          initializedState.counters[initializedState.currentCounterId || '']
            ?.data.value,
        ).toBe(0);
      });

      it('set the first counter as the current user if there are counters but no current counter is set', () => {
        const initializedState = reducer(
          {
            currentCounterId: null,
            counters: {
              counter_1: {
                name: 'Counter 1',
                data: counterSlice.getInitialState(),
              },
              counter_2: {
                name: 'Counter 2',
                data: counterSlice.getInitialState(),
              },
            },
          },
          countersSlice.actions.initialize(),
        );
        expect(initializedState.currentCounterId).toBe('counter_1');
      });

      it('set the first counter as the current counter if the current counter ID is invalid', () => {
        const initializedState = reducer(
          {
            currentCounterId: 'non_existing_counter_id',
            counters: {
              counter_1: {
                name: 'Counter 1',
                data: counterSlice.getInitialState(),
              },
              counter_2: {
                name: 'Counter 2',
                data: counterSlice.getInitialState(),
              },
            },
          },
          countersSlice.actions.initialize(),
        );
        expect(initializedState.currentCounterId).toBe('counter_1');
      });

      it('does nothing if a current counter exists', () => {
        const prevState: CountersState = {
          currentCounterId: 'counter_1',
          counters: {
            counter_1: {
              name: 'Counter 1',
              data: counterSlice.getInitialState(),
            },
            counter_2: {
              name: 'Counter 2',
              data: counterSlice.getInitialState(),
            },
          },
        };
        const nextState = reducer(
          prevState,
          countersSlice.actions.initialize(),
        );
        expect(nextState).toEqual(prevState);
      });
    });

    describe('addCounter', () => {
      it('should add a counter', () => {
        const previousState: CountersState = {
          currentCounterId: 'old_counter',
          counters: {
            old_counter: {
              name: 'Old Counter',
              data: counterSlice.getInitialState(),
            },
          },
        };
        const nextState = reducer(
          previousState,
          countersSlice.actions.addCounter(),
        );
        const newCounterId = Object.keys(nextState.counters).find(
          (id) => id !== 'old_counter',
        );
        expect(newCounterId).toBeTruthy();
      });
    });

    describe('switchCounter', () => {
      it('set the current counter to the specified counter', () => {
        const previousState: CountersState = {
          currentCounterId: 'counter_1',
          counters: {
            counter_1: {
              name: 'Counter 1',
              data: counterSlice.getInitialState(),
            },
            counter_2: {
              name: 'Counter 2',
              data: counterSlice.getInitialState(),
            },
          },
        };
        const nextState = reducer(
          previousState,
          countersSlice.actions.switchCounter('counter_2'),
        );
        expect(nextState.currentCounterId).toBe('counter_2');
      });

      it('ignores the action if the specified counter does not exists', () => {
        const previousState: CountersState = {
          currentCounterId: 'counter_1',
          counters: {
            counter_1: {
              name: 'Counter 1',
              data: counterSlice.getInitialState(),
            },
            counter_2: {
              name: 'Counter 2',
              data: counterSlice.getInitialState(),
            },
          },
        };
        const nextState = reducer(
          previousState,
          countersSlice.actions.switchCounter('unknown_counter_id'),
        );
        expect(nextState.currentCounterId).toBe('counter_1'); // unchanged
      });
    });

    describe('removeCounter', () => {
      it('should remove the specified counter', () => {
        const previousState: CountersState = {
          currentCounterId: 'counter_1',
          counters: {
            counter_1: {
              name: 'Counter 1',
              data: counterSlice.getInitialState(),
            },
            counter_2: {
              name: 'Counter 2',
              data: counterSlice.getInitialState(),
            },
          },
        };
        const nextState = reducer(
          previousState,
          countersSlice.actions.removeCounter('counter_2'),
        );
        expect(Object.keys(nextState.counters)).not.toContain('counter_2');
      });

      it('clears the current user while removing the current user', () => {
        const previousState: CountersState = {
          currentCounterId: 'counter_1',
          counters: {
            counter_1: {
              name: 'Counter 1',
              data: counterSlice.getInitialState(),
            },
            counter_2: {
              name: 'Counter 2',
              data: counterSlice.getInitialState(),
            },
          },
        };
        const nextState = reducer(
          previousState,
          countersSlice.actions.removeCounter('counter_1'),
        );
        expect(Object.keys(nextState.counters)).not.toContain('counter_1');
        expect(nextState.currentCounterId).toBeNull();
      });
    });

    describe('dispatchToCounter', () => {
      it('dispatches the action to the specific counter', () => {
        const previousState: CountersState = {
          currentCounterId: 'counter_1',
          counters: {
            counter_1: {
              name: 'Counter 1',
              data: counterSlice.getInitialState(),
            },
            counter_2: {
              name: 'Counter 2',
              data: counterSlice.getInitialState(),
            },
          },
        };
        const nextState = reducer(
          previousState,
          countersSlice.actions.dispatchToCounter({
            counterId: 'counter_2',
            action: counterSlice.actions.increment(),
          }),
        );
        expect(nextState.counters.counter_1?.data.value).toBe(0);
        expect(nextState.counters.counter_2?.data.value).toBe(1);
      });
    });
  });

  describe('sub-action handling', () => {
    describe('counter', () => {
      describe('increment', () => {
        it('should increase the counter value for the current counter by 1', () => {
          expect(
            reducer(
              {
                currentCounterId: '1',
                counters: {
                  '1': { name: 'Counter 1', data: { value: 1 } },
                  '2': { name: 'Counter 2', data: { value: 1 } },
                },
              },
              countersSlice.subActions.counter.increment(),
            ),
          ).toEqual({
            currentCounterId: '1',
            counters: {
              '1': { name: 'Counter 1', data: { value: 2 } },
              '2': { name: 'Counter 2', data: { value: 1 } },
            },
          });

          expect(
            reducer(
              {
                currentCounterId: '2',
                counters: {
                  '1': { name: 'Counter 1', data: { value: 1 } },
                  '2': { name: 'Counter 2', data: { value: 1 } },
                },
              },
              countersSlice.subActions.counter.increment(),
            ),
          ).toEqual({
            currentCounterId: '2',
            counters: {
              '1': { name: 'Counter 1', data: { value: 1 } },
              '2': { name: 'Counter 2', data: { value: 2 } },
            },
          });
        });

        it('do nothing if there is no current counter', () => {
          expect(
            reducer(
              {
                currentCounterId: null,
                counters: {
                  '1': { name: 'Counter 1', data: { value: 1 } },
                  '2': { name: 'Counter 2', data: { value: 1 } },
                },
              },
              countersSlice.subActions.counter.increment(),
            ),
          ).toEqual({
            currentCounterId: null,
            counters: {
              '1': { name: 'Counter 1', data: { value: 1 } },
              '2': { name: 'Counter 2', data: { value: 1 } },
            },
          });
        });
      });
    });
  });
});

describe('selectors', () => {
  const selectors = countersSlice.getSelectors();

  describe('currentCounterId', () => {
    it('should return the ID of the current counter', () => {
      expect(
        selectors.currentCounterId({
          currentCounterId: '1',
          counters: { '1': { name: 'Counter 1', data: { value: 123 } } },
        }),
      ).toEqual('1');
    });
  });
});

describe('sub-selectors', () => {
  const subSelectors = countersSlice.getSubSelectors();

  describe('counter', () => {
    describe('value', () => {
      it('should return the value of the current counter', () => {
        expect(
          subSelectors.counter.value({
            currentCounterId: '1',
            counters: {
              '1': { name: 'Counter 1', data: { value: 123 } },
              '2': { name: 'Counter 2', data: { value: 456 } },
            },
          }),
        ).toEqual(123);

        expect(
          subSelectors?.counter.value({
            currentCounterId: '2',
            counters: {
              '1': { name: 'Counter 1', data: { value: 123 } },
              '2': { name: 'Counter 2', data: { value: 456 } },
            },
          }),
        ).toEqual(456);
      });

      it('should return undefined if no current counter is set', () => {
        const value = subSelectors.counter.value({
          currentCounterId: null,
          counters: {
            '1': { name: 'Counter 1', data: { value: 123 } },
            '2': { name: 'Counter 2', data: { value: 456 } },
          },
        });

        // Test if typeof value can be undefined
        const _t: typeof value = undefined;

        expect(value).toBeUndefined();
      });
    });
  });
});
