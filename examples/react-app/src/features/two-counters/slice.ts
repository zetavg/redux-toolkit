import { createSlice } from '@reduxjs/toolkit';
import { isObject, makeSlice } from '@zetavg/redux-toolkit';

import counterSlice, { CounterState } from '../counter/slice';

export type TwoCountersState = {
  counterOne: CounterState;
  counterTwo: CounterState;
};

const initialState: TwoCountersState = {
  counterOne: counterSlice.getInitialState(),
  counterTwo: counterSlice.getInitialState(),
};

export const twoCountersSlice = makeSlice(
  createSlice({
    name: 'twoCounters',
    initialState,
    reducers: {},
    selectors: {},
  }),
)
  .mount(
    counterSlice,
    (state) => {
      return state.counterOne;
    },
    (state, subState) => {
      state.counterOne = subState;
      return state;
    },
    {
      asName: 'counterOne',
      persistState: (state) => ({
        counterOne:
          state.counterOne && counterSlice.persistState?.(state.counterOne),
      }),
      restoreState: (persistedData, originalState) => {
        if (!isObject(persistedData)) return originalState;

        return {
          ...originalState,
          counterOne:
            counterSlice.restoreState?.(
              persistedData.counterOne,
              originalState.counterOne,
            ) || originalState.counterOne,
        };
      },
    },
  )
  .mount(
    counterSlice,
    (state) => {
      return state.counterTwo;
    },
    (state, subState) => {
      state.counterTwo = subState;
      return state;
    },
    {
      asName: 'counterTwo',
      persistState: (state) => ({
        counterTwo:
          state.counterTwo && counterSlice.persistState?.(state.counterTwo),
      }),
      restoreState: (persistedData, originalState) => {
        if (!isObject(persistedData)) return originalState;

        return {
          ...originalState,
          counterTwo:
            counterSlice.restoreState?.(
              persistedData.counterTwo,
              originalState.counterTwo,
            ) || originalState.counterTwo,
        };
      },
    },
  );

export default twoCountersSlice;
