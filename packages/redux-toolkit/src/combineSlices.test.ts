import { createSlice } from '@reduxjs/toolkit';

import combineSlices from './combineSlices';

describe('combineSlices', () => {
  it('returns a combined root reducer', () => {
    const counterSlice = createSlice({
      name: 'counter',
      initialState: {
        value: 0,
      },
      reducers: {
        increment: (state) => {
          state.value += 1;
        },
        decrement: (state) => {
          state.value -= 1;
        },
      },
      selectors: {
        value: (state) => state.value,
      },
    });
    const { reducer } = combineSlices('combinedSlice', [counterSlice]);

    // The root reducer should be a function that returns the initial state
    expect(reducer(undefined, { type: '' })).toEqual({
      counter: {
        value: 0,
      },
    });

    // The root reducer should handle actions from the counter slice
    expect(
      reducer({ counter: { value: 1 } }, counterSlice.actions.increment()),
    ).toEqual({
      counter: {
        value: 2,
      },
    });
  });
});
