import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { makeSlice } from '@zetavg/redux-toolkit';

export type Appearance = 'dark' | 'light';

export type GlobalSettingsState = {
  appearance: Appearance;
};

const initialState: GlobalSettingsState = {
  appearance: 'light',
};

export const globalSettingsSlice = makeSlice(
  createSlice({
    name: 'globalSettings',
    initialState,
    reducers: {
      setAppearance: (state, action: PayloadAction<Appearance>) => {
        state.appearance = action.payload;
      },
    },
    selectors: {
      appearance: (state) => state.appearance,
    },
  }),
  { persistState: (state) => ({ appearance: state.appearance }) },
);

export default globalSettingsSlice;
