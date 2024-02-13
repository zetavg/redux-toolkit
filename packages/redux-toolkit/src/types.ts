/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Reducer } from '@reduxjs/toolkit';
import type { PartialDeep } from 'type-fest';

export type AnyActionType = (...args: Array<any>) => any;

export type SelectorType<ReturnType, State, Args extends Array<any> = []> = (
  state: State,
  ...args: Args
) => ReturnType;

export type AnyGetSelectorsTypeWithState<State> = () => Record<
  string,
  SelectorType<any, State, any>
>;

export type AnyGetSubSelectorsTypeWithState<State> = () => Record<
  string,
  Record<string, SelectorType<any, State, any>>
>;

export type SelectorWithInput<
  Selector extends SelectorType<any, any, any>,
  InputType,
  AdditionalReturnType = never,
> = Selector extends (state: any, ...args: infer Args) => infer ReturnType
  ? (state: InputType, ...args: Args) => ReturnType | AdditionalReturnType
  : never;

export type SelectorsWithInput<
  Selectors extends Record<string, SelectorType<any, any, any>>,
  InputType,
  AdditionalReturnType = never,
> = {
  [K in keyof Selectors]: SelectorWithInput<
    Selectors[K],
    InputType,
    AdditionalReturnType
  >;
};

export type SubSelectorsWithInput<
  SubSelectors extends Record<
    string,
    Record<string, SelectorType<any, any, any>>
  >,
  InputType,
> = {
  [K in keyof SubSelectors]: SelectorsWithInput<SubSelectors[K], InputType>;
};

/**
 * A type that is compatible with a `Slice` created from `@reduxjs/toolkit`.
 */
export type SliceLike<
  Name extends string,
  ReducerPath extends string,
  State,
  Actions extends Record<string, AnyActionType>,
  GetSelectors extends AnyGetSelectorsTypeWithState<State>,
  SubActions extends Record<string, Record<string, AnyActionType>>,
  GetSubSelectors extends AnyGetSubSelectorsTypeWithState<State>,
> = {
  name: Name;
  reducerPath: ReducerPath;
  reducer: Reducer<State>;
  getInitialState: () => State;
  actions: Actions;
  getSelectors: GetSelectors;
  subActions?: SubActions;
  getSubSelectors?: GetSubSelectors;
  persistState?: (state: Readonly<PartialDeep<State>>) => PartialDeep<State>;
  persistSensitiveState?: (
    state: Readonly<PartialDeep<State>>,
  ) => PartialDeep<State>;
  restoreState?: (
    persistedData: PartialDeep<State> | unknown,
    originalState: State,
  ) => State;
};

export type AnySliceLike = SliceLike<
  string,
  string,
  any,
  Record<string, AnyActionType>,
  AnyGetSelectorsTypeWithState<any>,
  Record<string, Record<string, AnyActionType>>,
  AnyGetSubSelectorsTypeWithState<any>
>;

// type MapSelectors<Selectors, InputState> = {
//   [K in keyof Selectors]: Selectors[K] extends (
//     state: any,
//     ...args: infer Args
//   ) => infer ReturnType
//     ? (state: InputState, ...args: Args) => ReturnType
//     : never;
// };

// type ConvertSelectors<ReducerPath extends string, State, T, AD> = {
//   [K in keyof T]: T[K] extends (s: any, ...args: infer A) => infer R
//     ? (s: { [p in ReducerPath]: State }, ...args: A) => R | AD
//     : never;
// };

export type SliceMountFn<Slice extends AnySliceLike> = <
  SubSlice extends AnySliceLike,
  StateSelectorCanReturnUndefined extends boolean = false,
  AsName extends string | undefined = undefined,
>(
  /**
   * The sub slice to mount into this slice.
   */
  subSlice: SubSlice,
  /**
   * A function to return the state of the sub slice from the state of this slice.
   */
  stateSelector: Slice extends SliceLike<
    any,
    any,
    infer State,
    any,
    any,
    any,
    any
  >
    ? SubSlice extends SliceLike<any, any, infer SubState, any, any, any, any>
      ? (
          s: Readonly<State>,
        ) =>
          | SubState
          | (StateSelectorCanReturnUndefined extends true ? undefined : never)
      : never
    : never,
  /**
   * A function to update the parent state with the given sub state, and return the updated parent state.
   */
  stateUpdater: Slice extends SliceLike<
    any,
    any,
    infer State,
    any,
    any,
    any,
    any
  >
    ? SubSlice extends SliceLike<any, any, infer SubState, any, any, any, any>
      ? (state: State, subState: Readonly<SubState>) => State | void
      : never
    : never,
  options?: {
    stateSelectorCanReturnUndefined?: StateSelectorCanReturnUndefined;
    asName?: AsName;
    persistState?: (
      state: Readonly<PartialDeep<ReturnType<Slice['reducer']>>>,
    ) => PartialDeep<ReturnType<Slice['reducer']>>;
    persistSensitiveState?: (
      state: Readonly<PartialDeep<ReturnType<Slice['reducer']>>>,
    ) => PartialDeep<ReturnType<Slice['reducer']>>;
    restoreState?: (
      persistedData: PartialDeep<ReturnType<Slice['reducer']>> | unknown,
      originalState: ReturnType<Slice['reducer']>,
    ) => ReturnType<Slice['reducer']>;
  },
) => Slice extends SliceLike<
  infer Name,
  infer ReducerPath,
  infer State,
  infer Actions,
  infer GenericSelectors,
  any,
  any
>
  ? SubSlice extends SliceLike<
      infer SubSliceName,
      any, // infer CSReducerPath,
      any, // infer SubState,
      infer SubSliceActions,
      infer SubSliceGetSelectors,
      any,
      any
    >
    ? SliceType<
        Name,
        ReducerPath,
        State,
        Actions,
        GenericSelectors,
        (Slice extends SliceType<any, any, any, any, any, infer SubActions, any>
          ? SubActions
          : Record<string, never>) & {
          [n in AsName extends string ? AsName : SubSliceName]: SubSliceActions;
        } & (SubSlice extends SliceType<
            any,
            any,
            any,
            any,
            any,
            infer SubSliceSubActions,
            any
          >
            ? SubSliceSubActions
            : Record<string, never>),
        () => (Slice extends SliceType<
          any,
          any,
          any,
          any,
          any,
          any,
          infer GetSubSelectors
        >
          ? ReturnType<GetSubSelectors>
          : Record<string, never>) & {
          [n in AsName extends string
            ? AsName
            : SubSliceName]: SelectorsWithInput<
            ReturnType<SubSliceGetSelectors>,
            State,
            StateSelectorCanReturnUndefined extends true ? undefined : never
          >;
        } & (SubSlice extends SliceType<
            any,
            any,
            any,
            any,
            any,
            any,
            infer SubSliceGetSubSelectors
          >
            ? SubSelectorsWithInput<ReturnType<SubSliceGetSubSelectors>, State>
            : Record<string, never>)
      >
    : never
  : never;

export type SliceType<
  Name extends string,
  ReducerPath extends string,
  State,
  Actions extends Record<string, AnyActionType>,
  GetSelectors extends AnyGetSelectorsTypeWithState<State>,
  SubActions extends Record<string, Record<string, AnyActionType>>,
  GetSubSelectors extends AnyGetSubSelectorsTypeWithState<State>,
> = SliceLike<
  Name,
  ReducerPath,
  State,
  Actions,
  GetSelectors,
  SubActions,
  GetSubSelectors
> & {
  subActions: SubActions;
  getSubSelectors: GetSubSelectors;
  /**
   * mount another slice into this slice.
   */
  mount: SliceMountFn<
    SliceType<
      Name,
      ReducerPath,
      State,
      Actions,
      GetSelectors,
      SubActions,
      GetSubSelectors
    >
  >;
};
