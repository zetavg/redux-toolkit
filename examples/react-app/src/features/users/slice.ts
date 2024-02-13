import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, nanoid } from '@reduxjs/toolkit';
import { isObject, makeSlice, mapObjectValues } from '@zetavg/redux-toolkit';

import countersSlice, { CountersState } from '../counters/slice';
import settingsSlice, { SettingsState } from '../settings/slice';

export type UserState = {
  name: string;
  settings: SettingsState;
  counters: CountersState;
};

export type UsersState = {
  currentUserId: string | null;
  users: { [id: string]: UserState | undefined };
};

const initialState: UsersState = {
  currentUserId: null,
  users: {},
};

export const getUserInitialState = (): UserState => ({
  name: 'Default User',
  settings: settingsSlice.getInitialState(),
  counters: countersSlice.getInitialState(),
});

export const usersSlice = makeSlice(
  createSlice({
    name: 'users',
    initialState,
    reducers: {
      initialize: (state) => {
        const currentUser = state.users[state.currentUserId ?? ''];
        // If a current user exists, do nothing
        if (currentUser) return;

        const userIds = Object.keys(state.users);
        if (userIds.length > 0) {
          // If there are users but no current user is set, set the first one as the current user
          state.currentUserId = userIds[0] || null;
          return;
        }

        // If there are no users at all, create a default one
        const finalState: UsersState = usersSlice.reducer(
          state,
          usersSlice.actions.createUser({ name: 'Default User' }),
        );
        return finalState;
      },
      createUser: (state, action: PayloadAction<{ name: string }>) => {
        const newUserId = nanoid();
        state.users[newUserId] = {
          ...getUserInitialState(),
          name: action.payload.name,
        };
        if (!state.currentUserId) state.currentUserId = newUserId;
      },
      removeUser: (state, action: PayloadAction<{ userId: string }>) => {
        if (action.payload.userId in state.users) {
          delete state.users[action.payload.userId];
        }
        if (state.currentUserId === action.payload.userId) {
          state.currentUserId = null;
        }
      },
      switchUser: (state, action: PayloadAction<{ userId: string }>) => {
        if (action.payload.userId in state.users) {
          state.currentUserId = action.payload.userId;
        }
      },
    },
    selectors: {
      currentUserId: (state) => state.currentUserId,
      currentUser: (state) => state.users[state.currentUserId ?? ''] || null,
      currentUserName: (state) => state.users[state.currentUserId ?? '']?.name,
      users: (state) => state.users,
      userNames: (state) => mapObjectValues(state.users, (user) => user?.name),
    },
  }),
  {
    persistState: (state) => ({
      currentUserId: state.currentUserId,
      users:
        state.users &&
        mapObjectValues(
          state.users,
          (user) =>
            user && {
              name: user.name,
            },
        ),
    }),
    restoreState: (persistedData, originalState) => {
      if (!isObject(persistedData)) {
        return originalState;
      }

      return {
        ...originalState,
        currentUserId:
          typeof persistedData.currentUserId === 'string'
            ? persistedData.currentUserId
            : originalState.currentUserId,
        users: isObject(persistedData.users)
          ? mapObjectValues(persistedData.users, (userPersistedData) => {
              if (!isObject(userPersistedData)) return undefined;

              const user: UserState = {
                ...getUserInitialState(),
                ...(typeof userPersistedData.name === 'string'
                  ? { name: userPersistedData.name }
                  : {}),
              };
              return user;
            })
          : originalState.users,
      };
    },
  },
)
  .mount(
    settingsSlice,
    (s) => s.users[s.currentUserId ?? '']?.settings,
    (s, subState) => {
      const currentUser = s.users[s.currentUserId ?? ''];
      if (currentUser) {
        currentUser.settings = subState;
      }
      return s;
    },
    {
      stateSelectorCanReturnUndefined: true,
      persistState: (state) => ({
        users:
          state.users &&
          mapObjectValues(
            state.users,
            (user) =>
              user && {
                settings:
                  user.settings && settingsSlice.persistState?.(user.settings),
              },
          ),
      }),
      restoreState: (persistedData, originalState) => {
        if (!isObject(persistedData)) return originalState;

        const persistedUsersData = persistedData.users;
        if (!isObject(persistedUsersData)) return originalState;

        return {
          ...originalState,
          users: mapObjectValues(originalState.users, (user, userId) => {
            if (!user) return user;

            const persistedUserData = persistedUsersData[userId];
            if (!isObject(persistedUserData)) return user;

            return {
              ...user,
              settings:
                settingsSlice.restoreState?.(
                  persistedUserData.settings,
                  user.settings,
                ) || user.settings,
            };
          }),
        };
      },
    },
  )
  .mount(
    countersSlice,
    (s) => s.users[s.currentUserId ?? '']?.counters,
    (s, subState) => {
      const currentUser = s.users[s.currentUserId ?? ''];
      if (currentUser) {
        currentUser.counters = subState;
      }
      return s;
    },
    {
      stateSelectorCanReturnUndefined: true,
      persistState: (state) => ({
        users:
          state.users &&
          mapObjectValues(
            state.users,
            (user) =>
              user && {
                counters:
                  user.counters && countersSlice.persistState?.(user.counters),
              },
          ),
      }),
      restoreState: (persistedData, originalState) => {
        if (!isObject(persistedData)) return originalState;

        const persistedUsersData = persistedData.users;
        if (!isObject(persistedUsersData)) return originalState;

        return {
          ...originalState,
          users: mapObjectValues(originalState.users, (user, userId) => {
            if (!user) return user;

            const persistedUserData = persistedUsersData[userId];
            if (!isObject(persistedUserData)) return user;

            return {
              ...user,
              counters:
                countersSlice.restoreState?.(
                  persistedUserData.counters,
                  user.counters,
                ) || user.counters,
            };
          }),
        };
      },
    },
  );

export default usersSlice;
