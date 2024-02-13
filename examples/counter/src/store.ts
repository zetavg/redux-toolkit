import { makeStore } from '@zetavg/redux-toolkit';

import counterSlice from './counterSlice';

export const { store, rootSlice, rootReducer, actions, selectors } = makeStore([
  counterSlice,
]);
