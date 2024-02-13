import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  isObject,
  makeSlice,
  mapObjectValues,
  nanoid,
} from '@zetavg/redux-toolkit';

import counterSlice, { CounterState } from '../counter/slice';

export type CountersState = {
  currentCounterId: string | null;
  counters: Partial<{ [id: string]: { name: string; data: CounterState } }>;
};

const initialState: CountersState = {
  currentCounterId: null,
  counters: {},
};

export const countersSlice = makeSlice(
  createSlice({
    name: 'counters',
    initialState,
    reducers: {
      initialize: (state) => {
        const currentCounter = state.counters[state.currentCounterId ?? ''];
        // Do nothing if a current counter exists
        if (currentCounter) return;

        const counterIds = Object.keys(state.counters);
        if (counterIds.length > 0) {
          // If there are counters but no current counter is set, set the first one as the current counter
          state.currentCounterId = counterIds[0] || null;
          return;
        }

        // If there are no counters at all, create one
        const finalState: CountersState = countersSlice.reducer(
          state,
          countersSlice.actions.addCounter(),
        );
        return finalState;
      },
      addCounter: (state) => {
        const newCounterId = nanoid();
        state.counters[newCounterId] = {
          name: `New Counter ${Object.keys(state.counters).length + 1}`,
          data: counterSlice.getInitialState(),
        };
        if (state.currentCounterId === null)
          state.currentCounterId = newCounterId;
      },
      renameCounter: (
        state,
        action: PayloadAction<{ id: string; name: string }>,
      ) => {
        const { id, name } = action.payload;
        const counter = state.counters[id];
        if (!counter) return;

        counter.name = name;
      },
      removeCounter: (state, action: PayloadAction<string>) => {
        const counterId = action.payload;
        if (counterId in state.counters) {
          delete state.counters[counterId];
        }
        if (state.currentCounterId === counterId) {
          state.currentCounterId = null;
        }
      },
      switchCounter: (state, action: PayloadAction<string>) => {
        if (action.payload in state.counters) {
          state.currentCounterId = action.payload;
        }
      },
      dispatchToCounter: (
        state,
        action: PayloadAction<{
          counterId: string;
          action: ReturnType<
            (typeof counterSlice.actions)[keyof typeof counterSlice.actions]
          >;
        }>,
      ) => {
        const { counterId, action: subAction } = action.payload;
        const subState = state.counters[counterId]?.data;
        if (subState) {
          const updatedSubState = counterSlice.reducer(subState, subAction);
          state.counters[counterId]!.data = updatedSubState;
        }
      },
    },
    selectors: {
      currentCounterId: (state) => state.currentCounterId,
      currentCounter: (state) =>
        state.counters[state.currentCounterId ?? ''] || null,
      counters: (state) => state.counters,
    },
  }),
  {
    persistState: (state) => ({
      // currentCounterId: state.currentCounterId,
      counters:
        state.counters &&
        mapObjectValues(state.counters, (s) => ({ name: s?.name })),
    }),
    restoreState: (persistedData, originalState) => {
      if (!isObject(persistedData)) return originalState;

      return {
        ...originalState,
        // currentCounterId:
        //   typeof persistedData.currentCounterId === 'string'
        //     ? persistedData.currentCounterId
        //     : originalState.currentCounterId,
        ...(isObject(persistedData.counters)
          ? {
              counters: mapObjectValues(persistedData.counters, (data) => {
                if (!isObject(data)) return undefined;

                return {
                  name:
                    typeof data.name === 'string'
                      ? data.name
                      : 'Unnamed Counter',
                  data: counterSlice.getInitialState(),
                };
              }),
            }
          : {}),
      };
    },
  },
).mount(
  counterSlice,
  (state) => {
    return state.counters[state.currentCounterId ?? '']?.data;
  },
  (state, subState) => {
    if (state.currentCounterId) {
      state.counters[state.currentCounterId]!.data = subState;
    }
    return state;
  },
  {
    stateSelectorCanReturnUndefined: true,
    persistState: (state) => ({
      counters:
        state.counters &&
        mapObjectValues(state.counters, (s) =>
          s?.data
            ? {
                data: counterSlice.persistState?.(s?.data),
              }
            : undefined,
        ),
    }),
    restoreState: (persistedData, originalState) => {
      if (!isObject(persistedData)) return originalState;

      const persistedCountersData = persistedData.counters;
      if (!isObject(persistedCountersData)) return originalState;

      return {
        ...originalState,
        counters: mapObjectValues(originalState.counters, (counter, id) => {
          if (!counter) return counter;

          const persistedCounterData = persistedCountersData[id];
          if (!isObject(persistedCounterData)) return counter;
          if (!isObject(persistedCounterData.data)) return counter;

          return {
            ...counter,
            data:
              counterSlice.restoreState?.(
                persistedCounterData.data,
                counter.data,
              ) || counter.data,
          };
        }),
      };
    },
  },
);

export default countersSlice;
