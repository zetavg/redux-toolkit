/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from '@reduxjs/toolkit';
import {
  CombinedSliceReducer,
  WithSlice,
} from '@reduxjs/toolkit/dist/combineSlices';
import { Id, UnionToIntersection } from '@reduxjs/toolkit/dist/tsHelpers';
import type { Reducer, StateFromReducersMapObject } from 'redux';
import { PartialDeep } from 'type-fest';

import combineSlices from './combineSlices';
import deepClean from './deepClean';
import deepMerge from './deepMerge';
import getObjectDiff from './getObjDiff';
import { AnySliceLike } from './types';
type ReducerMap = Record<string, Reducer>;
type InitialState<Slices extends Array<AnySliceLike | ReducerMap>> =
  UnionToIntersection<
    Slices[number] extends infer Slice
      ? Slice extends AnySliceLike
        ? WithSlice<Slice>
        : StateFromReducersMapObject<Slice>
      : never
  >;

export const RESTORE_ACTION_TYPE = '_persist/RESTORE';

export const persistSlice = createSlice({
  name: '_persist',
  initialState: { restored: false },
  reducers: {},
});

export type Persistor = {
  restored: boolean;
  subscribeRestored: (callback: () => void) => () => void;
  flush: () => void;
  restorePersistedState: () => void;
};

export const makeRoot = <Slices extends [AnySliceLike, ...Array<AnySliceLike>]>(
  slices: Readonly<Slices>,
  {
    persist,
    persistSensitive,
    getPersistedData,
    getPersistedSensitiveData,
    persistDebounce = 500,
    debug = false,
  }: {
    persist?: (
      state: PartialDeep<
        ReturnType<CombinedSliceReducer<Id<InitialState<Slices>>>>
      >,
      prevState: PartialDeep<
        ReturnType<CombinedSliceReducer<Id<InitialState<Slices>>>>
      >,
    ) => void;
    persistSensitive?: (
      state: PartialDeep<
        ReturnType<CombinedSliceReducer<Id<InitialState<Slices>>>>
      >,
      prevState: PartialDeep<
        ReturnType<CombinedSliceReducer<Id<InitialState<Slices>>>>
      >,
    ) => void;
    getPersistedData?: () => Promise<any>;
    getPersistedSensitiveData?: () => Promise<any>;
    persistDebounce?: number;
    debug?: boolean;
  } = {},
) => {
  const rootSlice = combineSlices('root', slices);
  (rootSlice as any).slices = slices;
  const {
    reducer,
    subActions,
    getSubSelectors,
    getInitialState,
    restoreState,
  } = rootSlice;

  const shouldWaitForRestore =
    !!getPersistedData || !!getPersistedSensitiveData;

  const persistedStateRef: {
    value: PartialDeep<
      ReturnType<CombinedSliceReducer<Id<InitialState<Slices>>>>
    >;
  } = { value: {} as any };
  const persistedSensitiveStateRef: {
    value: PartialDeep<
      ReturnType<CombinedSliceReducer<Id<InitialState<Slices>>>>
    >;
  } = { value: {} as any };

  let persistStartingState: ReturnType<
    CombinedSliceReducer<Id<InitialState<Slices>>>
  > | null = null;
  let persistEndingState: ReturnType<
    CombinedSliceReducer<Id<InitialState<Slices>>>
  > | null = null;
  let persistDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let doPersist: (() => void) | null = null;
  const persistMiddleware = (store: any) => (next: any) => (action: any) => {
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();

    if (action.type === RESTORE_ACTION_TYPE) return result;
    if (shouldWaitForRestore && !prevState._persist?.restored) return result;

    if (persist || persistSensitive) {
      if (!persistStartingState) persistStartingState = prevState;
      persistEndingState = nextState;

      if (persistDebounceTimer) clearTimeout(persistDebounceTimer);
      doPersist = () => {
        if (persistDebounceTimer) clearTimeout(persistDebounceTimer);
        persistDebounceTimer = null;

        doPersist = null;

        if (!persistStartingState || !persistEndingState) return;
        const diff = getObjectDiff(persistStartingState, persistEndingState);
        if (debug) {
          console.debug(
            'Persist: state change from',
            persistStartingState,
            'to',
            persistEndingState,
            ', diff:',
            JSON.parse(JSON.stringify(diff)),
          );
        }
        persistStartingState = null;
        persistEndingState = null;
        if (typeof diff !== 'object') return;

        (() => {
          if (!persist) return;

          const diffToPersist = deepClean(
            rootSlice.persistState?.(diff as any),
          );
          if (!diffToPersist || Object.keys(diffToPersist).length <= 0) return;

          const stateToPersist = deepMerge(
            persistedStateRef.value as any,
            diffToPersist as any,
          );

          if (debug) {
            console.debug(
              'Persist: selected state changes:',
              JSON.parse(JSON.stringify(diffToPersist)),
              ', state to persist:',
              stateToPersist,
            );
          }

          persist(stateToPersist as any, persistedStateRef.value);

          persistedStateRef.value = stateToPersist as any;
        })();

        (() => {
          if (!persistSensitive) return;

          const diffToPersist = deepClean(
            rootSlice.persistSensitiveState?.(diff as any),
          );
          if (!diffToPersist || Object.keys(diffToPersist).length <= 0) return;

          const stateToPersist = deepMerge(
            persistedSensitiveStateRef.value as any,
            diffToPersist,
          );

          if (debug) {
            console.debug(
              'Persist: selected sensitive state changes:',
              JSON.parse(JSON.stringify(diffToPersist)),
              ', sensitive state to persist:',
              stateToPersist,
            );
          }

          persistSensitive(stateToPersist, persistedSensitiveStateRef.value);

          persistedSensitiveStateRef.value = stateToPersist;
        })();
      };
      persistDebounceTimer = setTimeout(doPersist, persistDebounce);
    }

    return result;
  };

  let store: any;
  const setStore = (s: any) => {
    store = s;
  };

  const subscribeRestoredFns = new Set<() => void>();
  const persister: Persistor = {
    restored: !shouldWaitForRestore,
    subscribeRestored: (callback) => {
      if (persister.restored) {
        callback();
        return () => {};
      }

      subscribeRestoredFns.add(callback);
      const unsubscribe = () => {
        subscribeRestoredFns.delete(callback);
      };

      return unsubscribe;
    },
    flush: () => {
      if (doPersist) doPersist();
    },
    restorePersistedState: () => {},
  };

  let restorePersistedStateDebounceTimer: ReturnType<typeof setTimeout> | null =
    null;
  const restorePersistedState = async () => {
    if (persistDebounceTimer) {
      // Delay restorePersistedState if a persist is being debounced
      if (restorePersistedStateDebounceTimer)
        clearTimeout(restorePersistedStateDebounceTimer);
      restorePersistedStateDebounceTimer = setTimeout(
        restorePersistedState,
        persistDebounce + 10,
      );
      return;
    }

    if (!getPersistedData && !getPersistedSensitiveData) return;

    let [persistedData, persistedSensitiveData] = await Promise.all([
      getPersistedData?.(),
      getPersistedSensitiveData?.(),
    ]);

    if (!persistedData || typeof persistedData !== 'object') {
      persistedData = {};
    }
    if (!persistedSensitiveData || typeof persistedSensitiveData !== 'object') {
      persistedSensitiveData = {};
    }

    persistedData = deepMerge(persistedData, persistedSensitiveData);

    if (!store) {
      throw new Error('Store not set');
    }

    const initialState = rootSlice.getInitialState();
    const originalState = persister.restored ? store.getState() : initialState;
    const newState = restoreState(persistedData, originalState);
    const stateDiff = getObjectDiff(initialState, newState as any);

    if (debug) {
      console.debug(
        'Persist: restoring state from persisted data:',
        persistedData,
        ', state diff',
        JSON.parse(JSON.stringify(stateDiff)),
      );
    }

    if (typeof stateDiff === 'object') {
      persistedStateRef.value = JSON.parse(
        JSON.stringify(rootSlice.persistState?.(stateDiff) || {}),
      );
      persistedSensitiveStateRef.value = JSON.parse(
        JSON.stringify(rootSlice.persistSensitiveState?.(stateDiff) || {}),
      );
    }

    store.dispatch({ type: RESTORE_ACTION_TYPE, payload: newState });
    persister.restored = true;
    subscribeRestoredFns.forEach((fn) => fn());
  };
  restorePersistedState();
  persister.restorePersistedState = () => {
    if (restorePersistedStateDebounceTimer) {
      clearTimeout(restorePersistedStateDebounceTimer);
    }

    restorePersistedStateDebounceTimer = setTimeout(
      restorePersistedState,
      persistDebounce / 2,
    );
  };

  reducer.inject(persistSlice as any);
  const rootReducer = (
    ...[state, action]: Parameters<typeof reducer>
  ): ReturnType<typeof reducer> => {
    if (action.type === RESTORE_ACTION_TYPE) {
      return {
        ...state,
        ...(action.payload as any),
        _persist: {
          restored: true,
        },
      };
    }
    const nextState = reducer(...([state, action] as const));

    return nextState;
  };

  return {
    rootSlice,
    rootReducer,
    getInitialRootState: getInitialState,
    actions: subActions,
    selectors: getSubSelectors(),
    persistMiddleware,
    setStore,
    persister,
  };
};

export default makeRoot;
