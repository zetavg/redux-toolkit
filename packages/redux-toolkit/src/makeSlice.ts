/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';
import { PartialDeep } from 'type-fest';

import deepMerge from './deepMerge';
import {
  AnyActionType,
  AnyGetSelectorsTypeWithState,
  AnyGetSubSelectorsTypeWithState,
  SelectorsWithInput,
  SliceLike,
  SliceMountFn,
  SliceType,
} from './types';

export class SliceNameCollisionError extends Error {
  constructor(...args: Parameters<typeof Error>) {
    super(...args);

    // Set the prototype explicitly to make instanceof work
    Object.setPrototypeOf(this, SliceNameCollisionError.prototype);
  }
}

/**
 * Create a slice that other slices can be mounted into.
 * @param slice A slice-like object which is compatible to a slice created by `createSlice` from `@reduxjs/toolkit`.
 */
export const makeSlice = <
  Name extends string,
  ReducerPath extends string,
  State,
  Actions extends Record<string, AnyActionType>,
  GetSelectors extends AnyGetSelectorsTypeWithState<State>,
  SubActions extends Record<string, Record<string, (...args: any) => any>>,
  GetSubSelectors extends AnyGetSubSelectorsTypeWithState<State>,
>(
  sliceData: SliceLike<
    Name,
    ReducerPath,
    State,
    Actions,
    GetSelectors,
    SubActions,
    GetSubSelectors
  >,
  options: {
    /**
     * Pass a function to return a partial state to persist from a changed sub portion of the state.
     *
     * Remember to call all `persistState`s of all the sub-slices that will be mounted into this slice.
     *
     * If not provided, this slice of state and its sub-slices will not be persisted.
     */
    persistState?: (state: Readonly<PartialDeep<State>>) => PartialDeep<State>;
    /**
     * Pass a function to return a partial state to persist from a changed sub portion of the state.
     *
     * Remember to call all `persistState`s of all the sub-slices that will be mounted into this slice.
     *
     * If not provided, this slice of state and its sub-slices will not be persisted.
     */
    persistSensitiveState?: (
      state: Readonly<PartialDeep<State>>,
    ) => PartialDeep<State>;
    /**
     * Pass a function to customize how the state is restored from the persisted data.
     *
     * If not provided, it will be default to deep merge the persisted data into the original state.
     */
    restoreState?: (persistedData: unknown, originalState: State) => State;
  } = {},
): SliceType<
  Name,
  ReducerPath,
  State,
  Actions,
  // Since we will remove the `this` context of `getSelectors`, we'll need to redefine the type of `getSelectors`.
  () => SelectorsWithInput<ReturnType<GetSelectors>, State>,
  SubActions,
  GetSubSelectors
> => {
  // const {
  //   name,
  //   reducerPath,
  //   reducer,
  //   getInitialState,
  //   actions,
  //   subActions,
  //   getSubSelectors,
  // } = sliceData;

  const { getSelectors: _getSelectors, ...restOfSlice } = sliceData;
  const getSelectors: any = () => sliceData.getSelectors();
  const slice = {
    ...restOfSlice,
    ...options,
    getSelectors,
    subActions: sliceData.subActions || ({} as any),
    getSubSelectors: sliceData.getSubSelectors || ((() => {}) as any),
  };

  const sliceMount: SliceMountFn<
    SliceLike<
      Name,
      ReducerPath,
      State,
      Actions,
      // Since we will remove the `this` context of `getSelectors`, we'll need to redefine the type of `getSelectors`.
      () => SelectorsWithInput<ReturnType<GetSelectors>, State>,
      SubActions,
      GetSubSelectors
    >
  > = (
    subSlice,
    stateSelector,
    stateUpdater,
    { asName, persistState, persistSensitiveState, restoreState } = {},
  ) => {
    const subSliceName = asName || subSlice.name;
    if (subSliceName === slice.name) {
      throw new SliceNameCollisionError(
        `The slice ${subSlice.name}${asName ? ` (as name "${asName}")` : ''} has name collision with the slice to mount into (${slice.name})`,
      );
    }

    if (subSliceName in (slice.subActions || {})) {
      throw new SliceNameCollisionError(
        `The slice ${subSlice.name}${asName ? ` (as name "${asName}")` : ''} has name collision with slices already mounted into ${slice.name}`,
      );
    }

    // if (subSlice.name in (subSelectors || {})) {
    //   throw new SliceNameCollisionError(
    //     `The slice ${subSlice.name} has name collision with slices already mounted into ${slice.name}`,
    //   );
    // }

    if (subSlice.persistState && !persistState) {
      console.error(
        `"persistState" is not defined while mounting slice ${subSlice.name}${asName ? ` (as name "${asName}")` : ''} into ${slice.name}. This might cause the state to not be persisted properly.`,
      );
    }

    if (subSlice.persistSensitiveState && !persistSensitiveState) {
      console.error(
        `"persistSensitiveState" is not defined while mounting slice ${subSlice.name}${asName ? ` (as name "${asName}")` : ''} into ${slice.name}. This might cause the state to not be persisted properly.`,
      );
    }

    if (
      (options.restoreState || slice.restoreState || subSlice.restoreState) &&
      !restoreState
    ) {
      console.error(
        `"restoreState" is not defined while mounting slice ${subSlice.name}${asName ? ` (as name "${asName}")` : ''} into ${slice.name}. This might cause the state to not be restored properly.`,
      );
    }

    return makeSlice({
      ...slice,
      reducer: (state, action) => {
        const parentUpdatedState = slice.reducer(state, action);
        if (!parentUpdatedState) {
          throw new Error(
            `The reducer of slice ${slice.name} must return a state, got ${JSON.stringify(parentUpdatedState)}`,
          );
        }
        if (typeof parentUpdatedState !== 'object') {
          throw new Error(
            `The reducer of slice ${slice.name} must return an object, got ${typeof parentUpdatedState}`,
          );
        }

        if (
          typeof action.__reducerName === 'string' &&
          action.__reducerName !== (asName || subSlice.name) &&
          !(action.__reducerName in (subSlice.subActions || {}))
        ) {
          // Skip the action if it's not for this sub-slice or any of its sub-slices
          return parentUpdatedState;
        }

        const updatedState = produce(parentUpdatedState, (draftState) => {
          const updatedSubState = subSlice.reducer(
            stateSelector(draftState as any),
            action,
          );

          if (typeof updatedSubState !== 'object') {
            throw new Error(
              `The reducer of slice ${subSlice.name} must return an object, got ${typeof updatedSubState}`,
            );
          }

          const updatedWholeState = stateUpdater(
            draftState as any,
            updatedSubState,
          );

          if (updatedWholeState) {
            if (typeof updatedWholeState !== 'object') {
              throw new Error(
                `The stateUpdater of combining slice ${subSlice.name}${asName ? ` (as name "${asName}")` : ''} into ${slice.name} must return an object, got ${typeof updatedWholeState}`,
              );
            }

            Object.keys(updatedWholeState as any).forEach((key) => {
              (draftState as any)[key] = (updatedWholeState as any)[key];
            });
          }
        });

        return updatedState;
      },
      subActions: {
        ...slice.subActions,
        [subSliceName]: !(asName || subSlice.name)
          ? subSlice.actions
          : Object.fromEntries(
              Object.entries(subSlice.actions).map(([name, actionCreator]) => [
                name,
                (...args: any) => ({
                  ...actionCreator(...args),
                  __reducerName: asName || subSlice.name,
                }),
              ]),
            ),
        ...subSlice.subActions,
      },
      getSubSelectors: () => {
        const subSelectors = {
          ...slice.getSubSelectors?.(),
          ...Object.fromEntries(
            Object.entries({
              [subSliceName]: subSlice.getSelectors(),
              ...subSlice.getSubSelectors?.(),
            }).map(([sliceName, selectors]) => [
              sliceName,
              Object.fromEntries(
                Object.entries(selectors).map(([selectorName, selector]) => [
                  selectorName,
                  (state: State, ...args: any) => {
                    const subState = stateSelector(state);
                    if (subState === undefined) return undefined;
                    return selector(subState, ...args);
                  },
                ]),
              ),
            ]),
          ),
        };
        return subSelectors;
      },
      ...(slice.persistState || persistState
        ? {
            persistState: (state: Readonly<PartialDeep<State>>) => {
              const parentPersistedState = slice.persistState?.(state) || {};
              const persistedState = persistState?.(state) || {};
              return deepMerge(parentPersistedState, persistedState, {
                preserveDeletedSymbol: true,
              }) as PartialDeep<State>;
            },
          }
        : {}),
      ...(slice.persistSensitiveState || persistSensitiveState
        ? {
            persistSensitiveState: (state: Readonly<PartialDeep<State>>) => {
              const parentPersistedState =
                slice.persistSensitiveState?.(state) || {};
              const persistedState = persistSensitiveState?.(state) || {};
              return deepMerge(parentPersistedState, persistedState, {
                preserveDeletedSymbol: true,
              }) as PartialDeep<State>;
            },
          }
        : {}),
      ...(slice.restoreState || restoreState
        ? {
            restoreState: (persistedData: unknown, originalState: State) => {
              const parentRestoredState =
                slice.restoreState?.(persistedData, originalState) ||
                deepMerge(originalState as any, persistedData as any);
              const restoredState =
                restoreState?.(persistedData, parentRestoredState as any) ||
                parentRestoredState;
              return restoredState as State;
            },
          }
        : {}),
    }) as any;
  };

  return {
    ...slice,
    mount: sliceMount,
  };
};

export default makeSlice;
