import { createSlice } from '@reduxjs/toolkit';

import { makeSlice, SliceNameCollisionError } from './makeSlice';

describe('slice', () => {
  describe('mount', () => {
    it('throws if the slice to mount has name collision with slices already mounted', () => {
      const subSlice = makeSlice(
        createSlice({
          name: 'slice_1',
          initialState: {},
          reducers: {},
        }),
      );
      const slice = makeSlice(
        createSlice({
          name: 'slice_2',
          initialState: {},
          reducers: {},
        }),
      ).mount(
        subSlice,
        (state) => state,
        (state, _subState) => state,
      );
      expect(() => {
        slice.mount(
          createSlice({
            name: 'slice_1', // Already used in `subSlice`
            initialState: {},
            reducers: {},
          }),
          (state) => state,
          (state, _subState) => state,
        );
      }).toThrow(SliceNameCollisionError);
    });

    it('throws if the slice to mount has sub-slice name collision with slices already mounted', () => {
      const nestedSubSlice = createSlice({
        name: 'slice_0',
        initialState: {},
        reducers: {},
      });
      const subSlice = makeSlice(
        createSlice({
          name: 'slice_1',
          initialState: {},
          reducers: {},
        }),
      ).mount(
        nestedSubSlice,
        (state) => state,
        (state, _subState) => state,
      );
      const slice = makeSlice(
        createSlice({
          name: 'slice_2',
          initialState: {},
          reducers: {},
        }),
      ).mount(
        subSlice,
        (state) => state,
        (state, _subState) => state,
      );
      expect(() => {
        slice.mount(
          createSlice({
            name: 'slice_0', // Already used in `nestedSubSlice`
            initialState: {},
            reducers: {},
          }),
          (state) => state,
          (state, _subState) => state,
        );
      }).toThrow(SliceNameCollisionError);
    });

    it('throws if the slice to mount has name collision with the slice to mount into', () => {
      const slice = makeSlice(
        createSlice({
          name: 'slice_1',
          initialState: {},
          reducers: {},
        }),
      );
      expect(() => {
        slice.mount(
          createSlice({
            name: 'slice_1', // Already used in `subSlice`
            initialState: {},
            reducers: {},
          }),
          (state) => state,
          (state, _subState) => state,
        );
      }).toThrow(SliceNameCollisionError);
    });
  });
});
