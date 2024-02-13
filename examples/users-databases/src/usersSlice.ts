/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  isObject,
  makeSlice,
  mapObjectValues,
  type PayloadAction,
} from '@zetavg/redux-toolkit';

import databasesSlice, { DatabasesState } from './databasesSlice';

export type UserState = {
  name: string;
  databases: DatabasesState;
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
  databases: databasesSlice.getInitialState(),
});

export const usersSlice = makeSlice(
  createSlice({
    name: 'users',
    initialState,
    reducers: {
      addUser: (state, action: PayloadAction<{ id: string; name: string }>) => {
        const { id, ...data } = action.payload;
        if (id in state.users) return;

        state.users[id] = {
          ...getUserInitialState(),
          ...data,
        };
      },
      renameUser: (
        state,
        action: PayloadAction<{ id: string; name: string }>,
      ) => {
        const { id, name } = action.payload;

        const existingUser = state.users[id];
        if (!existingUser) return;

        state.users[id] = {
          ...existingUser,
          name,
        };
      },
      removeUser: (state, action: PayloadAction<{ id: string }>) => {
        const { id } = action.payload;

        delete state.users[id];

        if (state.currentUserId === id) {
          state.currentUserId = null;
        }
      },
      setCurrentUser: (state, action: PayloadAction<{ id: string }>) => {
        const { id } = action.payload;

        if (id in state.users) {
          state.currentUserId = id;
        }
      },
    },
    selectors: {},
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
        currentUserId:
          typeof persistedData.currentUserId === 'string'
            ? persistedData.currentUserId
            : originalState.currentUserId,
        users:
          !!persistedData.users && isObject(persistedData.users)
            ? mapObjectValues(persistedData.users, (userData) => {
                if (!userData || typeof userData !== 'object') return undefined;

                const user: UserState = {
                  ...getUserInitialState(),
                  name:
                    'name' in userData && typeof userData.name === 'string'
                      ? userData.name
                      : 'Unnamed User',
                };

                return user;
              })
            : originalState.users,
      };
    },
  },
).mount(
  databasesSlice,
  (s) => s.users[s.currentUserId ?? '']?.databases,
  (s, subState) => {
    const currentUser = s.users[s.currentUserId ?? ''];
    if (currentUser) {
      currentUser.databases = subState;
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
              databases:
                user.databases && databasesSlice.persistState?.(user.databases),
            },
        ),
    }),
    persistSensitiveState: (state) => ({
      users:
        state.users &&
        mapObjectValues(
          state.users,
          (user) =>
            user && {
              databases:
                user.databases &&
                databasesSlice.persistSensitiveState?.(user.databases),
            },
        ),
    }),
    restoreState: (persistedData, originalState) => {
      if (!isObject(persistedData)) return originalState;

      const persistedUsersData = persistedData.users;
      if (!isObject(persistedUsersData)) return originalState;

      return {
        ...originalState,
        users: mapObjectValues(originalState.users, (user, id) => {
          if (!user) return user;

          const userData = persistedUsersData[id];
          if (!isObject(userData)) return user;

          return {
            ...user,
            ...(databasesSlice.restoreState
              ? {
                  databases: databasesSlice.restoreState(
                    userData.databases,
                    user.databases,
                  ),
                }
              : {}),
          };
        }),
      };
    },
  },
);

export default usersSlice;
