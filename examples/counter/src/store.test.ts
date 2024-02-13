import { makeStore } from '@zetavg/redux-toolkit';
import { PartialDeep } from 'type-fest';

import counterSlice from './counterSlice';

describe('persistance', () => {
  it('should call the persisted function with the correct debounced state', async () => {
    let lastPersistState: null | PartialDeep<ReturnType<typeof rootReducer>> =
      null;
    let lastPersistPrevState: null | PartialDeep<
      ReturnType<typeof rootReducer>
    > = null;
    let lastPersistSensitiveState: null | PartialDeep<
      ReturnType<typeof rootReducer>
    > = null;
    let lastPersistSensitivePrevState: null | PartialDeep<
      ReturnType<typeof rootReducer>
    > = null;

    const { store, rootReducer, actions } = makeStore([counterSlice], {
      persist: (state, prevState) => {
        lastPersistState = state;
        lastPersistPrevState = prevState;
      },
      persistSensitive: (state, prevState) => {
        lastPersistSensitiveState = state;
        lastPersistSensitivePrevState = prevState;
      },
      persistDebounce: 100,
    });

    store.dispatch(actions.counter.increment());
    store.dispatch(actions.counter.increment());
    store.dispatch(actions.counter.increment());
    store.dispatch(actions.counter.increment());
    store.dispatch(actions.counter.increment());
    await new Promise((resolve) => setTimeout(resolve, 110));
    expect(lastPersistPrevState).toEqual({});
    expect(lastPersistState).toEqual({ counter: { value: 5 } });

    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    await new Promise((resolve) => setTimeout(resolve, 110));
    expect(lastPersistSensitivePrevState).toEqual({});
    expect(lastPersistSensitiveState).toEqual({
      counter: { sensitiveValue: 7 },
    });

    store.dispatch(actions.counter.decrement());
    store.dispatch(actions.counter.decrement());
    store.dispatch(actions.counter.increment());
    store.dispatch(actions.counter.decrement());
    await new Promise((resolve) => setTimeout(resolve, 110));
    expect(lastPersistPrevState).toEqual({ counter: { value: 5 } });
    expect(lastPersistState).toEqual({ counter: { value: 3 } });

    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveDecrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    store.dispatch(actions.counter.sensitiveDecrement());
    store.dispatch(actions.counter.sensitiveIncrement());
    await new Promise((resolve) => setTimeout(resolve, 110));
    expect(lastPersistSensitivePrevState).toEqual({
      counter: { sensitiveValue: 7 },
    });
    expect(lastPersistSensitiveState).toEqual({
      counter: { sensitiveValue: 12 },
    });
  });
});
