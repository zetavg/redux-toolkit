import settingsSlice from '../settings/slice';

import { getUserInitialState, usersSlice, UsersState } from './slice';

describe('reducer', () => {
  const { reducer } = usersSlice;

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(
      usersSlice.getInitialState(),
    );
  });

  describe('action handling', () => {
    describe('initialize', () => {
      it('creates a default user if there are no users', () => {
        const initializedState = reducer(
          usersSlice.getInitialState(),
          usersSlice.actions.initialize(),
        );
        expect(initializedState.currentUserId).toBeTruthy();
        expect(
          initializedState.users[initializedState.currentUserId || '']?.name,
        ).toBe('Default User');
      });

      it('set the first user as the current user if there are users but no current user is set', () => {
        const initializedState = reducer(
          {
            currentUserId: null,
            users: {
              user_1: getUserInitialState(),
              user_2: getUserInitialState(),
            },
          },
          usersSlice.actions.initialize(),
        );
        expect(initializedState.currentUserId).toBe('user_1');
      });

      it('set the first user as the current user if the current user ID is invalid', () => {
        const initializedState = reducer(
          {
            currentUserId: 'non_existing_user_id',
            users: {
              user_1: getUserInitialState(),
              user_2: getUserInitialState(),
            },
          },
          usersSlice.actions.initialize(),
        );
        expect(initializedState.currentUserId).toBe('user_1');
      });

      it('does nothing if a current user exists', () => {
        const prevState: UsersState = {
          currentUserId: 'user_1',
          users: {
            user_1: getUserInitialState(),
            user_2: getUserInitialState(),
          },
        };
        const nextState = reducer(prevState, usersSlice.actions.initialize());
        expect(nextState).toEqual(prevState);
      });
    });

    describe('createUser', () => {
      it('should handle user creation', () => {
        const previousState: UsersState = {
          currentUserId: 'old_user',
          users: {
            old_user: {
              ...getUserInitialState(),
              name: 'User 1',
            },
          },
        };
        const nextState = reducer(
          previousState,
          usersSlice.actions.createUser({ name: 'New User' }),
        );
        const newUserId = Object.keys(nextState.users).find(
          (id) => id !== 'old_user',
        );
        expect(newUserId).toBeTruthy();
        expect(nextState.users[newUserId || '']?.name).toBe('New User');
      });
    });

    describe('switchUser', () => {
      it('should set the current user to the specified user', () => {
        const previousState: UsersState = {
          currentUserId: 'user_1',
          users: {
            user_1: {
              ...getUserInitialState(),
              name: 'User 1',
            },
            user_2: {
              ...getUserInitialState(),
              name: 'User 2',
            },
          },
        };
        const nextState = reducer(
          previousState,
          usersSlice.actions.switchUser({ userId: 'user_2' }),
        );
        expect(nextState.currentUserId).toBe('user_2');
      });

      it('ignores the action if the specified user does not exists', () => {
        const previousState: UsersState = {
          currentUserId: 'user_1',
          users: {
            user_1: {
              ...getUserInitialState(),
              name: 'User 1',
            },
            user_2: {
              ...getUserInitialState(),
              name: 'User 2',
            },
          },
        };
        const nextState = reducer(
          previousState,
          usersSlice.actions.switchUser({ userId: 'unknown_user_id' }),
        );
        expect(nextState.currentUserId).toBe('user_1'); // unchanged
      });
    });

    describe('removeUser', () => {
      it('should remove the specified user', () => {
        const previousState: UsersState = {
          currentUserId: 'user_1',
          users: {
            user_1: {
              ...getUserInitialState(),
              name: 'User 1',
            },
            user_2: {
              ...getUserInitialState(),
              name: 'User 2',
            },
          },
        };
        const nextState = reducer(
          previousState,
          usersSlice.actions.removeUser({ userId: 'user_2' }),
        );
        expect(Object.keys(nextState.users)).not.toContain('user_2');
      });

      it('clears the current user while removing the current user', () => {
        const previousState: UsersState = {
          currentUserId: 'user_1',
          users: {
            user_1: {
              ...getUserInitialState(),
              name: 'User 1',
            },
            user_2: {
              ...getUserInitialState(),
              name: 'User 2',
            },
          },
        };
        const nextState = reducer(
          previousState,
          usersSlice.actions.removeUser({ userId: 'user_1' }),
        );
        expect(Object.keys(nextState.users)).not.toContain('user_1');
        expect(nextState.currentUserId).toBeNull();
      });
    });
  });

  describe('sub-action handling', () => {
    describe('settings', () => {
      describe('setColor', () => {
        it('should set the color setting of the current user', () => {
          const previousState: UsersState = {
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
          };
          const nextState = reducer(
            previousState,
            usersSlice.subActions.settings.setColor('green'),
          );
          expect(nextState.users.user_1?.settings.color).toBe('green');
        });
      });
    });

    describe('counter', () => {
      describe('increment', () => {
        it('should increase the counter value for the current counter of the current user by 1', () => {
          const previousState: UsersState = {
            currentUserId: 'user_1',
            users: {
              user_1: {
                ...getUserInitialState(),
                counters: {
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
          };
          const nextState = reducer(
            previousState,
            usersSlice.subActions.counter.increment(),
          );
          expect(
            nextState.users.user_1?.counters.counters.counter_1?.data.value,
          ).toBe(2);
        });
      });
    });
  });
});

describe('selectors', () => {
  const selectors = usersSlice.getSelectors();

  describe('currentUserId', () => {
    it('should return the ID of the current user', () => {
      expect(
        selectors.currentUserId({
          currentUserId: 'user_1',
          users: {
            user_1: {
              ...getUserInitialState(),
              name: 'User 1',
            },
          },
        }),
      ).toEqual('user_1');
    });
  });

  describe('currentUser', () => {
    it('should return the state of the current user', () => {
      const userState = {
        ...getUserInitialState(),
        name: 'User 1',
      };
      expect(
        selectors.currentUser({
          currentUserId: 'user_1',
          users: {
            user_1: userState,
          },
        }),
      ).toEqual(userState);
    });
  });

  describe('currentUserName', () => {
    it('should return the name of the current user', () => {
      expect(
        selectors.currentUserName({
          currentUserId: 'user_1',
          users: {
            user_1: {
              ...getUserInitialState(),
              name: 'User 1',
            },
          },
        }),
      ).toEqual('User 1');
    });
  });
});

describe('sub-selectors', () => {
  const subSelectors = usersSlice.getSubSelectors();

  describe('settings', () => {
    describe('color', () => {
      it('should return the color setting of the current user', () => {
        expect(
          subSelectors.settings.color({
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
          }),
        ).toEqual('red');
      });
    });
  });

  const getStateWithCurrentUserAndCounter = (
    currentUserId: string | null,
    currentCounterId: string | null,
  ): UsersState => ({
    currentUserId,
    users: {
      user_1: {
        ...getUserInitialState(),
        counters: {
          currentCounterId,
          counters: {
            counter_1: {
              name: 'Counter 1',
              data: { value: 1 },
            },
            counter_2: {
              name: 'Counter 2',
              data: { value: 2 },
            },
          },
        },
      },
      user_2: {
        ...getUserInitialState(),
        counters: {
          currentCounterId,
          counters: {
            counter_3: {
              name: 'Counter 3',
              data: { value: 3 },
            },
            counter_4: {
              name: 'Counter 4',
              data: { value: 4 },
            },
          },
        },
      },
    },
  });

  describe('counter', () => {
    describe('value', () => {
      it('should return the value of the current counter of the current user', () => {
        expect(
          subSelectors.counter.value(
            getStateWithCurrentUserAndCounter('user_1', 'counter_1'),
          ),
        ).toEqual(1);
        expect(
          subSelectors.counter.value(
            getStateWithCurrentUserAndCounter('user_1', 'counter_2'),
          ),
        ).toEqual(2);
        expect(
          subSelectors.counter.value(
            getStateWithCurrentUserAndCounter('user_2', 'counter_3'),
          ),
        ).toEqual(3);
        expect(
          subSelectors.counter.value(
            getStateWithCurrentUserAndCounter('user_2', 'counter_4'),
          ),
        ).toEqual(4);
      });

      it('should return undefined if no current counter is set', () => {
        const value = subSelectors.counter.value(
          getStateWithCurrentUserAndCounter('user_1', null),
        );

        // Test if typeof value can be undefined
        const _t: typeof value = undefined;

        expect(value).toBeUndefined();
      });

      it('should return undefined if no current user is set', () => {
        const value = subSelectors.counter.value(
          getStateWithCurrentUserAndCounter(null, 'counter_1'),
        );

        // Test if typeof value can be undefined
        const _t: typeof value = undefined;

        expect(value).toBeUndefined();
      });
    });
  });

  describe('counters', () => {
    describe('currentCounterId', () => {
      it('should return the ID of the current counter of the current user', () => {
        expect(
          subSelectors.counters.currentCounterId(
            getStateWithCurrentUserAndCounter('user_1', 'counter_1'),
          ),
        ).toEqual('counter_1');
        expect(
          subSelectors.counters.currentCounterId(
            getStateWithCurrentUserAndCounter('user_2', 'counter_3'),
          ),
        ).toEqual('counter_3');
      });
    });
  });
});
