/* eslint-disable @typescript-eslint/no-explicit-any */
import { combineSlices as rtkCombineSlices } from '@reduxjs/toolkit';
import type { PartialDeep } from 'type-fest';

import deepMerge from './deepMerge';
import { AnySliceLike, SelectorType, SubSelectorsWithInput } from './types';

/**
 * Use distributive conditional types to get all sub actions of possible slices.
 */
type GetSubActions<T> = T extends { subActions: infer SA }
  ? SA
  : Record<string, never>;

/**
 * Use distributive conditional types to get all actions of possible slices.
 */
type GetActions<T> = T extends {
  name: infer N extends string;
  actions: infer A;
}
  ? { [name in N]: A }
  : never;

/**
 * Use distributive conditional types to get all sub selectors of possible slices.
 */
type GetSubSelectors<T> = UnionToIntersection<
  T extends { getSubSelectors: () => infer S } ? S : Record<string, never>
>;

/**
 * Use distributive conditional types to get all actions of possible slices.
 */
type GetSelectors<T> = UnionToIntersection<
  T extends {
    name: infer N extends string;
    getSelectors: (...args: any) => infer S;
  }
    ? { [name in N]: S }
    : never
>;

/** Magic! From: https://stackoverflow.com/a/50375286/3416647 */
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

export const combineSlices = <
  Name extends string,
  Slices extends [AnySliceLike, ...Array<AnySliceLike>],
>(
  name: Name,
  slices: Readonly<Slices>,
) => {
  const slicesMap = Object.fromEntries(
    slices.map((slice) => [slice.name, slice]),
  );
  const reducer = rtkCombineSlices(...(slices as Slices));

  const actions: GetActions<Slices[number]> & GetSubActions<Slices[number]> = {
    ...slices.reduce(
      (acc, slice) => ({ ...acc, [slice.name]: slice.actions }),
      {},
    ),
    ...slices.reduce((acc, slice) => ({ ...acc, ...slice.subActions }), {}),
  } as any;

  const selectors: SubSelectorsWithInput<
    GetSelectors<Slices[number]> &
      GetSubSelectors<Slices[number]> extends Record<
      string,
      Record<string, SelectorType<any, any, any>>
    >
      ? GetSelectors<Slices[number]> & GetSubSelectors<Slices[number]>
      : never,
    ReturnType<typeof reducer>
  > = {
    ...slices.reduce(
      (acc, slice) => ({
        ...acc,
        [slice.name]: Object.fromEntries(
          Object.entries(slice.getSelectors()).map(([name, selector]) => [
            name,
            (state: ReturnType<typeof reducer>, ...args: any) =>
              selector((state as any)[slice.reducerPath], ...args),
          ]),
        ),
      }),
      {},
    ),
    ...slices.reduce(
      (acc, slice) => ({
        ...acc,
        ...Object.fromEntries(
          Object.entries(slice.getSubSelectors?.() || {}).map(
            ([subSliceName, selectors]) => [
              subSliceName,
              Object.fromEntries(
                Object.entries(selectors).map(([name, selector]) => [
                  name,
                  (state: ReturnType<typeof reducer>, ...args: any) =>
                    selector((state as any)[slice.reducerPath], ...args),
                ]),
              ),
            ],
          ),
        ),
      }),
      {},
    ),
  } as any;

  const persistState = (
    state: Readonly<PartialDeep<ReturnType<typeof reducer>>>,
  ): PartialDeep<ReturnType<typeof reducer>> => {
    return Object.fromEntries(
      Object.entries(state as any)
        .map(([key, value]) => {
          if (!slicesMap[key]) return [key, undefined];
          return [key, slicesMap[key]?.persistState?.(value as any)];
        })
        .filter(
          ([, value]) => value !== undefined && Object.keys(value).length > 0,
        ) as any,
    ) as any;
  };

  const persistSensitiveState = (
    state: Readonly<PartialDeep<ReturnType<typeof reducer>>>,
  ): PartialDeep<ReturnType<typeof reducer>> => {
    return Object.fromEntries(
      Object.entries(state as any)
        .map(([key, value]) => {
          if (!slicesMap[key]) return [key, undefined];
          return [key, slicesMap[key]?.persistSensitiveState?.(value as any)];
        })
        .filter(
          ([, value]) => value !== undefined && Object.keys(value).length > 0,
        ) as any,
    ) as any;
  };

  const restoreState = (
    persistedData: PartialDeep<ReturnType<typeof reducer>> | unknown,
    originalState: ReturnType<typeof reducer>,
  ): PartialDeep<ReturnType<typeof reducer>> => {
    return Object.fromEntries(
      Object.entries(originalState as any)
        .map(([key, value]) => {
          if (!slicesMap[key]) return [key, value];
          return [
            key,
            slicesMap[key]?.restoreState?.(
              ((persistedData || {}) as any)[key] || {},
              value,
            ) ||
              deepMerge(
                value as any,
                ((persistedData || {}) as any)[key] || {},
              ),
          ];
        })
        .filter(([, value]) => value !== undefined) as any,
    ) as any;
  };

  const combinedSlice = {
    name,
    reducerPath: name,
    reducer,
    getInitialState: () => reducer(undefined, { type: '' }),
    actions: {},
    getSelectors: () => ({}),
    subActions: actions,
    getSubSelectors: () => selectors,
    persistState,
    persistSensitiveState,
    restoreState,
  };

  // Type check that the combined slice is a valid slice.
  const _t1: AnySliceLike = combinedSlice;

  return combinedSlice;
};

export default combineSlices;
