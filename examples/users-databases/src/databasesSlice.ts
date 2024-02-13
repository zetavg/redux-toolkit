import {
  createSlice,
  isObject,
  makeSlice,
  mapObjectValues,
  PayloadAction,
} from '@zetavg/redux-toolkit';

export type Database = {
  url: string;
  username: string;
  password: string;
};
export type DatabasesState = {
  currentDatabaseId: string | null;
  databases: Partial<{ [id: string]: Database }>;
};
export const databasesInitialState: DatabasesState = {
  currentDatabaseId: null,
  databases: {},
};
export const databasesSlice = makeSlice(
  createSlice({
    name: 'databases',
    initialState: databasesInitialState,
    reducers: {
      addDatabase: (
        state,
        action: PayloadAction<{
          id: string;
          url: string;
          username: string;
          password: string;
        }>,
      ) => {
        const { id, ...database } = action.payload;
        if (id in state.databases) return;

        state.databases[id] = database;
      },
      updateDatabase: (
        state,
        action: PayloadAction<
          {
            id: string;
          } & Partial<{
            url: string;
            username: string;
            password: string;
          }>
        >,
      ) => {
        const { id, ...newData } = action.payload;
        const existingDatabase = state.databases[id];
        if (!existingDatabase) return;

        state.databases[id] = {
          ...existingDatabase,
          ...newData,
        };
      },
      removeDatabase: (
        state,
        action: PayloadAction<{
          id: string;
        }>,
      ) => {
        const { id } = action.payload;
        delete state.databases[id];

        if (state.currentDatabaseId === id) {
          state.currentDatabaseId = null;
        }
      },
      setCurrentDatabase: (
        state,
        action: PayloadAction<{
          id: string;
        }>,
      ) => {
        const { id } = action.payload;

        if (id in state.databases) {
          state.currentDatabaseId = action.payload.id;
        }
      },
    },
  }),
  {
    persistState: (s) => ({
      databases:
        s.databases &&
        mapObjectValues(s.databases, (db) => {
          if (!db) return db;

          const { password: _, ...data } = db;
          return data;
        }),
    }),
    persistSensitiveState: (s) => ({
      databases:
        s.databases &&
        mapObjectValues(s.databases, (db) => {
          if (!db) return db;

          const { password, ..._ } = db;
          return { password };
        }),
    }),
    restoreState: (persistedData, originalState) => {
      if (!isObject(persistedData)) {
        return originalState;
      }

      const restoredState = {
        ...originalState,
      };

      if (isObject(persistedData.databases)) {
        restoredState.databases = mapObjectValues(
          persistedData.databases,
          (data) => {
            if (!isObject(data)) return undefined;
            if (!data.url) return undefined;

            const db: Database = {
              ...data,
              url: typeof data.url === 'string' ? data.url : '',
              username: typeof data.username === 'string' ? data.username : '',
              password: typeof data.password === 'string' ? data.password : '',
            };

            return db;
          },
        );
      }

      return restoredState;
    },
  },
);

export default databasesSlice;
