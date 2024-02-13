/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from '@reduxjs/toolkit';
import {
  CombinedSliceReducer,
  WithSlice,
} from '@reduxjs/toolkit/dist/combineSlices';
import { Id, UnionToIntersection } from '@reduxjs/toolkit/dist/tsHelpers';
import type { Reducer, StateFromReducersMapObject } from 'redux';
import { PartialDeep } from 'type-fest';

import makeRoot from './makeRoot';
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

export const makeStore = <
  Slices extends [AnySliceLike, ...Array<AnySliceLike>],
>(
  slices: Readonly<Slices>,
  options: {
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
  const rootStuff = makeRoot(slices, options);
  const { setStore, rootReducer, persistMiddleware } = rootStuff;

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(persistMiddleware),
  });

  setStore(store);

  return {
    ...rootStuff,
    store,
  };
};

export default makeStore;
