import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { isObject, makeSlice } from '@zetavg/redux-toolkit';

export type CounterState = {
  value: number;
};

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = makeSlice(
  createSlice({
    name: 'counter',
    initialState,
    reducers: {
      increment: (state) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes
        state.value += 1;
      },
      decrement: (state) => {
        state.value -= 1;
      },
      incrementByAmount: (state, action: PayloadAction<number>) => {
        state.value += action.payload;
      },
    },
    selectors: {
      value: (state) => state.value,
    },
  }),
  {
    persistState: (state) => ({
      value: state.value,
    }),
    restoreState: (persistedData, originalState) => {
      if (!isObject(persistedData)) return originalState;

      return {
        value:
          typeof persistedData.value === 'number'
            ? persistedData.value
            : originalState.value,
      };
    },
  },
);

export default counterSlice;
