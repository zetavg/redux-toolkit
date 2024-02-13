/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeStore } from '@zetavg/redux-toolkit';

import counterSlice from '../features/counter/slice';
import countersSlice from '../features/counters/slice';
import globalSettingsSlice from '../features/global-settings/slice';
import twoCountersSlice from '../features/two-counters/slice';
import usersSlice from '../features/users/slice';

// Example 0: A single counter slice
// export const { store, persister, rootReducer, actions, selectors } = makeStore(
//   [counterSlice],
//   {
//     persist: (state) => {
//       localStorage.setItem('counter', JSON.stringify(state));
//     },
//     getPersistedData: async () => {
//       return JSON.parse(localStorage.getItem('counter') || '{}');
//     },
//   },
// );
// End of Example 0

// Example 1-1: Wrapping the counter slice to provide multiple counters
// export const { store, persister, rootReducer, actions, selectors } = makeStore(
//   [countersSlice],
//   {
//     persist: (state) => {
//       localStorage.setItem('counters', JSON.stringify(state));
//     },
//     getPersistedData: async () => {
//       return JSON.parse(localStorage.getItem('counters') || '{}');
//     },
//   },
// );
// End of Example 1-1

// Example 1-2: Wrapping the counter slice to provide two named counters
// export const { store, persister, rootReducer, actions, selectors } = makeStore(
//   [twoCountersSlice],
//   {
//     persist: (state) => {
//       localStorage.setItem('two-counters', JSON.stringify(state));
//     },
//     getPersistedData: async () => {
//       return JSON.parse(localStorage.getItem('two-counters') || '{}');
//     },
//   },
// );
// End of Example 1-2

// Example 2: Wrap the whole app for multi-user support
export const { store, persister, rootReducer, actions, selectors } = makeStore(
  [usersSlice, globalSettingsSlice],
  {
    persist: (state, prevState) => {
      if (state.globalSettings !== prevState.globalSettings) {
        localStorage.setItem(
          'global_settings',
          JSON.stringify(state.globalSettings),
        );
        console.debug('Persisted global settings:', state.globalSettings);
      }
      if (state.users?.currentUserId !== prevState.users?.currentUserId) {
        localStorage.setItem(
          'users-current_user_id',
          JSON.stringify(state.users?.currentUserId),
        );
        console.debug('Persisted current user ID:', state.users?.currentUserId);
      }
      Object.entries(state.users?.users || {}).forEach(([id, user]) => {
        if (user !== prevState.users?.users?.[id]) {
          localStorage.setItem(`users-user-${id}`, JSON.stringify(user));
          console.debug('Persisted user:', id, user);
        }
      });
      Object.keys(prevState.users?.users || {}).forEach((id) => {
        if (!(id in (state.users?.users || {}))) {
          localStorage.removeItem(`users-user-${id}`);
          console.debug('Persisted user removal:', id);
        }
      });
    },
    getPersistedData: async () => {
      const globalSettings = JSON.parse(
        localStorage.getItem('global_settings') || '{}',
      );

      const currentUserId = JSON.parse(
        localStorage.getItem('users-current_user_id') || 'null',
      );

      const users = Object.fromEntries(
        Object.entries(localStorage)
          .filter(([key]) => key.startsWith('users-user-'))
          .map(([key, value]) => [key.slice(11), JSON.parse(value)]),
      );

      return {
        globalSettings,
        users: {
          currentUserId,
          users,
        },
      };
    },
  },
);
// End of Example 2

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
