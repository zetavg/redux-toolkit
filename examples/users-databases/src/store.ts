import { makeRoot } from '@zetavg/redux-toolkit';

import globalSettingsSlice from './globalSettingsSlice';
import usersSlice from './usersSlice';

export const { rootSlice, rootReducer, actions, selectors } = makeRoot([
  usersSlice,
  globalSettingsSlice,
]);
