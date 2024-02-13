import countersSlice from './counters/slice';
import globalSettingsSlice from './global-settings/slice';
import settingsSlice from './settings/slice';
import usersSlice, { getUserInitialState } from './users/slice';
import {
  actions,
  getInitialRootState,
  rootReducer,
  RootState,
  selectors,
} from './all';

describe('rootReducer', () => {
  test('should return the initial state', () => {
    expect(rootReducer(undefined, { type: '' })).toEqual({
      _persist: {
        restored: false,
      },
      globalSettings: globalSettingsSlice.getInitialState(),
      users: usersSlice.getInitialState(),
    });
  });

  describe('action handling', () => {
    describe('globalSettings', () => {
      describe('setColor', () => {
        it('should set the color setting', () => {
          const previousState: RootState = {
            ...getInitialRootState(),
            globalSettings: {
              ...globalSettingsSlice.getInitialState(),
              appearance: 'light',
            },
          };
          const nextState = rootReducer(
            previousState,
            actions.globalSettings.setAppearance('dark'),
          );
          expect(nextState.globalSettings.appearance).toBe('dark');
        });
      });
    });

    describe('settings', () => {
      describe('setColor', () => {
        it('should set the color setting for the current user', () => {
          const previousState: RootState = {
            ...getInitialRootState(),
            users: {
              ...usersSlice.getInitialState(),
              currentUserId: 'user_1',
              users: {
                user_1: {
                  ...getUserInitialState(),
                  settings: {
                    ...settingsSlice.getInitialState(),
                    color: 'blue',
                  },
                },
              },
            },
          };
          const nextState = rootReducer(
            previousState,
            actions.settings.setColor('green'),
          );
          expect(nextState.users.users.user_1?.settings.color).toBe('green');
        });
      });
    });

    describe('counter', () => {
      describe('increment', () => {
        it('should increase the counter value for the current counter of the current user by 1', () => {
          const previousState: RootState = {
            ...getInitialRootState(),
            users: {
              ...usersSlice.getInitialState(),
              currentUserId: 'user_1',
              users: {
                user_1: {
                  ...getUserInitialState(),
                  counters: {
                    ...countersSlice.getInitialState(),
                    currentCounterId: 'counter_1',
                    counters: {
                      counter_1: {
                        name: 'Counter 1',
                        data: { value: 1 },
                      },
                    },
                  },
                },
              },
            },
          };
          const nextState = rootReducer(
            previousState,
            usersSlice.subActions.counter.increment(),
          );
          expect(
            nextState.users.users.user_1?.counters.counters.counter_1?.data
              .value,
          ).toBe(2);
        });
      });
    });
  });
});

describe('actions', () => {
  test('should have the correct type for counter increment action', () => {
    expect(actions.counter.increment().type).toBe('counter/increment');
  });

  test('should have the correct type for counter decrement action', () => {
    expect(actions.counter.decrement().type).toBe('counter/decrement');
  });

  test('should have the correct type for counter increment by amount action', () => {
    expect(actions.counter.incrementByAmount(5).type).toBe(
      'counter/incrementByAmount',
    );
  });

  test('should have the correct type for counters switchCounter action', () => {
    expect(actions.counters.switchCounter('').type).toBe(
      'counters/switchCounter',
    );
  });

  test('should have the correct type for settings setColor action', () => {
    expect(actions.settings.setColor('blue').type).toBe('settings/setColor');
  });

  test('should have the correct type for globalSettings setAppearance action', () => {
    expect(actions.globalSettings.setAppearance('dark').type).toBe(
      'globalSettings/setAppearance',
    );
  });
});

describe('selectors', () => {
  test('globalSettings.color should return the correct value', () => {
    const state: RootState = {
      ...getInitialRootState(),
      globalSettings: {
        appearance: 'dark',
      },
    };
    expect(selectors.globalSettings.appearance(state)).toBe('dark');
  });

  test('settings.color should return the correct value', () => {
    const state: RootState = {
      ...getInitialRootState(),
      users: {
        ...usersSlice.getInitialState(),
        currentUserId: 'user_1',
        users: {
          user_1: {
            ...getUserInitialState(),
            settings: {
              ...settingsSlice.getInitialState(),
              color: 'red',
            },
          },
        },
      },
    };
    expect(selectors.settings.color(state)).toBe('red');
  });

  test('counter.value should return the correct value', () => {
    const state: RootState = {
      ...getInitialRootState(),
      users: {
        ...usersSlice.getInitialState(),
        currentUserId: 'user_1',
        users: {
          user_1: {
            ...getUserInitialState(),
            counters: {
              ...countersSlice.getInitialState(),
              currentCounterId: 'counter_1',
              counters: {
                counter_1: {
                  name: 'Counter 1',
                  data: { value: 123 },
                },
              },
            },
          },
        },
      },
    };
    expect(selectors.counter.value(state)).toBe(123);
  });
});
