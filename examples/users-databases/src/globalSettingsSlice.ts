import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { makeSlice } from '@zetavg/redux-toolkit';

export type Theme = 'system' | 'dark' | 'light';

export type GlobalSettingsState = {
  theme: Theme;
};

const initialState: GlobalSettingsState = {
  theme: 'system',
};

export const globalSettingsSlice = makeSlice(
  createSlice({
    name: 'globalSettings',
    initialState,
    reducers: {
      setTheme: (state, action: PayloadAction<Theme>) => {
        state.theme = action.payload;
      },
    },
    selectors: {
      theme: (state) => state.theme,
    },
  }),
  { persistState: (state) => ({ theme: state.theme }) },
);

export default globalSettingsSlice;
