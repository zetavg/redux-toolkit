import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { makeSlice } from '@zetavg/redux-toolkit';

export const COLORS = [
  'blue',
  'brown',
  'gray',
  'green',
  'indigo',
  'yellow',
  'red',
  'purple',
  'orange',
  'teal',
] as const;

export type Color = (typeof COLORS)[number];

export function isValidColor(color: string): color is Color {
  return (COLORS as ReadonlyArray<string>).includes(color);
}

export type SettingsState = {
  color: Color;
};

const initialState: SettingsState = {
  color: 'indigo',
};

export const settingsSlice = makeSlice(
  createSlice({
    name: 'settings',
    initialState,
    reducers: {
      setColor: (state, action: PayloadAction<Color>) => {
        state.color = action.payload;
      },
    },
    selectors: {
      color: (state) => state.color,
    },
  }),
  {
    persistState: (state) => state,
    restoreState: (persistedData, originalState) => {
      return {
        ...originalState,
        ...(persistedData as typeof originalState),
      };
    },
  },
);

export default settingsSlice;
