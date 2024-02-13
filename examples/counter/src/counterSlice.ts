import { createSlice } from '@reduxjs/toolkit';
import { makeSlice } from '@zetavg/redux-toolkit';

export type CounterState = {
  value: number;
  sensitiveValue: number;
};

const initialState: CounterState = {
  value: 0,
  sensitiveValue: 0,
};

export const counterSlice = makeSlice(
  createSlice({
    name: 'counter',
    initialState,
    reducers: {
      increment: (state) => {
        state.value += 1;
      },
      decrement: (state) => {
        state.value -= 1;
      },
      sensitiveIncrement: (state) => {
        state.sensitiveValue += 1;
      },
      sensitiveDecrement: (state) => {
        state.sensitiveValue -= 1;
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
    persistSensitiveState: (state) => ({
      sensitiveValue: state.sensitiveValue,
    }),
  },
);

export default counterSlice;
