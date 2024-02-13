/* eslint-disable @typescript-eslint/no-unused-vars */
import { configureStore } from '@reduxjs/toolkit';
import { makeRoot } from '@zetavg/redux-toolkit';

import globalSettingsSlice from './global-settings/slice';
import usersSlice from './users/slice';

export const { rootReducer, actions, selectors, getInitialRootState } =
  makeRoot([globalSettingsSlice, usersSlice]);

export type RootState = ReturnType<typeof getInitialRootState>;
