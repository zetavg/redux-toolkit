/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore, makeRoot, makeStore } from '@zetavg/redux-toolkit';
import { PartialDeep } from 'type-fest';

import globalSettingsSlice from './globalSettingsSlice';
import { rootSlice } from './store';
import usersSlice from './usersSlice';

describe('persistance', () => {
  test('the persist function should be called when updated state needs to be persisted', async () => {
    let lastPersistState: any = null;
    let lastPersistPrevState: any = null;

    const { rootReducer, actions, persistMiddleware } = makeRoot(
      [usersSlice, globalSettingsSlice],
      {
        persist(state, prevState) {
          lastPersistState = state;
          lastPersistPrevState = prevState;
        },
        persistDebounce: 0,
      },
    );

    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(persistMiddleware),
    });

    store.dispatch(actions.users.addUser({ id: 'a', name: 'Alice' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistPrevState).toEqual({});
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: undefined,
        users: {
          a: {
            name: 'Alice',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });

    store.dispatch(actions.users.addUser({ id: 'b', name: 'Bob' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistPrevState).toEqual({
      users: {
        currentUserId: undefined,
        users: {
          a: {
            name: 'Alice',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: undefined,
        users: {
          a: {
            name: 'Alice',
            // databases: {
            //   databases: {},
            // },
          },
          b: {
            name: 'Bob',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });
    expect(
      lastPersistState.users.users.a === lastPersistPrevState.users.users.a,
    ).toBe(true); // Object reference of unchanged part should be the same

    store.dispatch(actions.users.setCurrentUser({ id: 'a' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            // databases: {
            //   databases: {},
            // },
          },
          b: {
            name: 'Bob',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });

    store.dispatch(
      actions.databases.addDatabase({
        id: 'a',
        url: 'https://example.com/db',
        username: 'user',
        password: 'password',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });
    expect(
      lastPersistState.users.users.a === lastPersistPrevState.users.users.a,
    ).toBe(false); // Object reference of changed part should not be the same
    expect(
      lastPersistState.users.users.b === lastPersistPrevState.users.users.b,
    ).toBe(true); // Object reference of unchanged part should be the same

    store.dispatch(actions.databases.removeDatabase({ id: 'a' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {},
            },
          },
          b: {
            name: 'Bob',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });
    expect(
      lastPersistState.users.users.a === lastPersistPrevState.users.users.a,
    ).toBe(false); // Object reference of changed part should not be the same
    expect(
      lastPersistState.users.users.b === lastPersistPrevState.users.users.b,
    ).toBe(true); // Object reference of unchanged part should be the same

    store.dispatch(actions.users.renameUser({ id: 'a', name: 'Amanda' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Amanda',
            databases: {
              databases: {},
            },
          },
          b: {
            name: 'Bob',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });
    expect(
      lastPersistState.users.users.a.databases ===
        lastPersistPrevState.users.users.a.databases,
    ).toBe(true); // Object reference of unchanged part should be the same
  });

  test('the persist function should be called when database is deleted', async () => {
    let lastPersistState: null | PartialDeep<ReturnType<typeof rootReducer>> =
      null;
    let lastPersistPrevState: null | PartialDeep<
      ReturnType<typeof rootReducer>
    > = null;

    const { store, rootReducer, actions } = makeStore(
      [usersSlice, globalSettingsSlice],
      {
        persist(state, prevState) {
          lastPersistState = state;
          lastPersistPrevState = prevState;
        },
        getPersistedData: async () => ({
          users: {
            currentUserId: 'a',
            users: {
              a: {
                name: 'Alice',
                databases: {
                  databases: {
                    a: {
                      url: 'https://example.com/db',
                      username: 'user',
                    },
                    b: {
                      url: 'https://example.com/db',
                      username: 'user',
                    },
                  },
                },
              },
              b: {
                name: 'Bob',
                databases: {
                  databases: {
                    b: {
                      url: 'https://example.com/db',
                      username: 'user',
                    },
                  },
                },
              },
            },
          },
        }),
        persistDebounce: 0,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 10));

    store.dispatch(actions.databases.removeDatabase({ id: 'a' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistPrevState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: { url: 'https://example.com/db', username: 'user' },
                b: { url: 'https://example.com/db', username: 'user' },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: { url: 'https://example.com/db', username: 'user' },
              },
            },
          },
        },
      },
    });
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                b: { url: 'https://example.com/db', username: 'user' },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: { url: 'https://example.com/db', username: 'user' },
              },
            },
          },
        },
      },
    });

    store.dispatch(actions.databases.removeDatabase({ id: 'b' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistPrevState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                b: { url: 'https://example.com/db', username: 'user' },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: { url: 'https://example.com/db', username: 'user' },
              },
            },
          },
        },
      },
    });
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {},
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: { url: 'https://example.com/db', username: 'user' },
              },
            },
          },
        },
      },
    });
  });

  test('the persistSensitive function should be called when updated state needs to be persisted', async () => {
    let lastPersistState: any = null;
    let lastPersistPrevState: any = null;

    const { rootReducer, actions, persistMiddleware } = makeRoot(
      [usersSlice, globalSettingsSlice],
      {
        persistSensitive(state, prevState) {
          lastPersistState = state;
          lastPersistPrevState = prevState;
        },
        persistDebounce: 0,
      },
    );

    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(persistMiddleware),
    });

    store.dispatch(actions.users.addUser({ id: 'a', name: 'Alice' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // // the persistSensitive function should be called here because Alice's databases is initialized with an empty object.
    // expect(lastPersistPrevState).toEqual({});
    // expect(lastPersistState).toEqual({
    //   users: { users: { a: { databases: { databases: {} } } } },
    // });
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    lastPersistPrevState = null;
    lastPersistState = null;

    store.dispatch(actions.users.addUser({ id: 'b', name: 'Bob' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // // the persistSensitive function should be called here because Alice's databases is initialized with an empty object.
    // expect(lastPersistPrevState).toEqual({
    //   users: { users: { a: { databases: { databases: {} } } } },
    // });
    // expect(lastPersistState).toEqual({
    //   users: {
    //     users: {
    //       a: { databases: { databases: {} } },
    //       b: { databases: { databases: {} } },
    //     },
    //   },
    // });
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    lastPersistPrevState = null;
    lastPersistState = null;

    store.dispatch(actions.users.setCurrentUser({ id: 'a' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // expect the persistSensitive function to not be called
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);

    store.dispatch(
      actions.databases.addDatabase({
        id: 'a',
        url: 'https://example.com/db',
        username: 'user',
        password: 'password',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        users: {
          a: {
            databases: {
              databases: {
                a: {
                  password: 'password',
                },
              },
            },
          },
          // b: {
          //   databases: {
          //     databases: {},
          //   },
          // },
        },
      },
    });

    store.dispatch(
      actions.databases.addDatabase({
        id: 'b',
        url: 'https://example.com/db',
        username: 'user_b',
        password: 'password_b',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        users: {
          a: {
            databases: {
              databases: {
                a: {
                  password: 'password',
                },
                b: {
                  password: 'password_b',
                },
              },
            },
          },
          // b: {
          //   databases: {
          //     databases: {},
          //   },
          // },
        },
      },
    });
    expect(
      lastPersistState.users.users.a === lastPersistPrevState.users.users.a,
    ).toBe(false); // Object reference of changed part should not be the same
    expect(
      lastPersistState.users.users.a.databases.databases.a ===
        lastPersistPrevState.users.users.a.databases.databases.a,
    ).toBe(true); // Object reference of unchanged part should be the same
    expect(
      lastPersistState.users.users.b === lastPersistPrevState.users.users.b,
    ).toBe(true); // Object reference of unchanged part should be the same

    store.dispatch(
      actions.databases.removeDatabase({
        id: 'a',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        users: {
          a: {
            databases: {
              databases: {
                b: {
                  password: 'password_b',
                },
              },
            },
          },
          // b: {
          //   databases: {
          //     databases: {},
          //   },
          // },
        },
      },
    });
  });

  test('the persistSensitive function should not be called when updated state does not needs to be persisted', async () => {
    let lastPersistState: any = null;
    let lastPersistPrevState: any = null;

    const { store, actions } = makeStore([usersSlice, globalSettingsSlice], {
      persistSensitive(state, prevState) {
        lastPersistState = state;
        lastPersistPrevState = prevState;
      },
      persistDebounce: 0,
    });

    store.dispatch(actions.users.addUser({ id: 'a', name: 'Alice' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // the persistSensitive function should be called here because Alice's databases is initialized with an empty object.
    // expect(lastPersistPrevState).toEqual({});
    // expect(lastPersistState).toEqual({
    //   users: { users: { a: { databases: { databases: {} } } } },
    // });
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    lastPersistPrevState = null;
    lastPersistState = null;

    store.dispatch(actions.users.renameUser({ id: 'a', name: 'Amalia' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // the persistSensitive function should not be called here because Alice's databases password is not changed.
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    lastPersistPrevState = null;
    lastPersistState = null;

    store.dispatch(actions.users.setCurrentUser({ id: 'a' }));
    store.dispatch(
      actions.databases.addDatabase({
        id: 'a',
        url: 'https://example.com/db',
        username: 'user',
        password: 'password',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    // the persistSensitive function should be called here because Amalia has added a new database with password.
    expect(lastPersistPrevState).toEqual({
      // users: { users: { a: { databases: { databases: {} } } } },
    });
    expect(lastPersistState).toEqual({
      users: {
        users: {
          a: { databases: { databases: { a: { password: 'password' } } } },
        },
      },
    });
    lastPersistPrevState = null;
    lastPersistState = null;

    store.dispatch(
      actions.databases.updateDatabase({
        id: 'a',
        url: 'https://example.com/db_updated',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    // the persistSensitive function should not be called here because Alice's databases password is not changed.
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    lastPersistPrevState = null;
    lastPersistState = null;
  });

  test('store state should be restored correctly', async () => {
    const { store } = makeStore([usersSlice, globalSettingsSlice], {
      getPersistedData: async () => ({
        users: {
          currentUserId: 'a',
          users: {
            a: {
              name: 'Alice',
              databases: {
                databases: {
                  a: {
                    url: 'https://example.com/db',
                    username: 'user',
                  },
                },
              },
            },
            b: {
              name: 'Bob',
              databases: {
                databases: {
                  b: {
                    url: 'https://example.com/db',
                    username: 'user',
                  },
                },
              },
            },
          },
        },
      }),
      getPersistedSensitiveData: async () => ({
        users: {
          users: {
            a: {
              databases: {
                databases: {
                  a: {
                    password: 'password',
                  },
                  non_exist: {
                    password: 'password',
                  },
                },
              },
            },
            b: {
              databases: {
                databases: {},
              },
            },
          },
        },
      }),
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(store.getState()).toEqual({
      _persist: { restored: true },
      globalSettings: {
        theme: 'system',
      },
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              currentDatabaseId: null,
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                  password: 'password',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              currentDatabaseId: null,
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                  password: '',
                },
              },
            },
          },
        },
      },
    });
  });

  test('should delay persisting until the state is restored', async () => {
    let lastPersistState: any = null;
    let lastPersistPrevState: any = null;
    let lastPersistSensitiveState: any = null;
    let lastPersistSensitivePrevState: any = null;

    let resolveGetPersistedData: any;
    let resolveGetPersistedSensitiveData: any;

    const { store, actions } = makeStore([usersSlice, globalSettingsSlice], {
      persist(state, prevState) {
        lastPersistState = state;
        lastPersistPrevState = prevState;
      },
      persistSensitive(state, prevState) {
        lastPersistSensitiveState = state;
        lastPersistSensitivePrevState = prevState;
      },
      getPersistedData: () =>
        new Promise((resolve) => (resolveGetPersistedData = resolve)),
      getPersistedSensitiveData: () =>
        new Promise((resolve) => (resolveGetPersistedSensitiveData = resolve)),
      persistDebounce: 0,
    });

    store.dispatch(actions.users.addUser({ id: 'd', name: 'David' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Expect the persist function to not be called
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    expect(lastPersistSensitivePrevState).toEqual(null);
    expect(lastPersistSensitiveState).toEqual(null);

    store.dispatch(actions.users.addUser({ id: 'e', name: 'Eve' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Expect the persist function to not be called
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    expect(lastPersistSensitivePrevState).toEqual(null);
    expect(lastPersistSensitiveState).toEqual(null);

    resolveGetPersistedData({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    store.dispatch(actions.users.addUser({ id: 'f', name: 'Frank' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Expect the persist function to not be called
    expect(lastPersistPrevState).toEqual(null);
    expect(lastPersistState).toEqual(null);
    expect(lastPersistSensitivePrevState).toEqual(null);
    expect(lastPersistSensitiveState).toEqual(null);

    resolveGetPersistedSensitiveData({
      users: {
        users: {
          a: {
            databases: {
              databases: {
                a: {
                  password: 'password',
                },
              },
            },
          },
          b: {
            databases: {
              databases: {},
            },
          },
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    store.dispatch(actions.users.addUser({ id: 'c', name: 'Charlie' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistPrevState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
        },
      },
    });
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          c: {
            name: 'Charlie',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });
    // expect(lastPersistSensitivePrevState).toEqual({
    //   users: {
    //     users: {
    //       a: {
    //         databases: {
    //           databases: {
    //             a: {
    //               password: 'password',
    //             },
    //           },
    //         },
    //       },
    //       b: {
    //         databases: {
    //           databases: {
    //             b: { password: '' },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });
    // expect(lastPersistSensitiveState).toEqual({
    //   users: {
    //     users: {
    //       a: {
    //         databases: {
    //           databases: {
    //             a: {
    //               password: 'password',
    //             },
    //           },
    //         },
    //       },
    //       b: {
    //         databases: {
    //           databases: { b: { password: '' } },
    //         },
    //       },
    //       // c: {
    //       //   databases: {
    //       //     databases: {},
    //       //   },
    //       // },
    //     },
    //   },
    // });

    store.dispatch(
      actions.databases.addDatabase({
        id: 'new',
        url: 'https://example.com/new',
        username: 'username',
        password: 'password',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistPrevState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          c: {
            name: 'Charlie',
          },
        },
      },
    });
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
                new: {
                  url: 'https://example.com/new',
                  username: 'username',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          c: {
            name: 'Charlie',
            // databases: {
            //   databases: {},
            // },
          },
        },
      },
    });
    expect(lastPersistSensitivePrevState).toEqual({
      users: {
        users: {
          a: {
            databases: {
              databases: {
                a: {
                  password: 'password',
                },
              },
            },
          },
          b: {
            databases: {
              databases: {
                b: { password: '' },
              },
            },
          },
        },
      },
    });
    expect(lastPersistSensitiveState).toEqual({
      users: {
        users: {
          a: {
            databases: {
              databases: {
                a: {
                  password: 'password',
                },
                new: {
                  password: 'password',
                },
              },
            },
          },
          b: {
            databases: {
              databases: { b: { password: '' } },
            },
          },
          // c: {
          //   databases: {
          //     databases: {},
          //   },
          // },
        },
      },
    });
  });

  test('it can restore from an empty state', async () => {
    const { store } = makeStore([usersSlice, globalSettingsSlice], {
      getPersistedData: async () => undefined,
      getPersistedSensitiveData: async () => undefined,
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(store.getState()).toEqual({
      _persist: { restored: true },
      globalSettings: {
        theme: 'system',
      },
      users: {
        currentUserId: null,
        users: {},
      },
    });
  });

  test('can restore again after the state is restored', async () => {
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

    let persistedData: PartialDeep<ReturnType<typeof rootReducer>> = {
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
        },
      },
    };

    let persistedSensitiveData: PartialDeep<ReturnType<typeof rootReducer>> = {
      users: {
        users: {
          a: {
            databases: {
              databases: {
                a: {
                  password: 'password',
                },
              },
            },
          },
          b: {
            databases: {
              databases: {
                b: {
                  password: 'password',
                },
              },
            },
          },
        },
      },
    };

    const { store, persister, rootReducer, actions } = makeStore(
      [usersSlice, globalSettingsSlice],
      {
        persist: (state, prevState) => {
          lastPersistState = state;
          lastPersistPrevState = prevState;
        },
        persistSensitive: (state, prevState) => {
          lastPersistSensitiveState = state;
          lastPersistSensitivePrevState = prevState;
        },
        getPersistedData: async (): Promise<any> => persistedData,
        getPersistedSensitiveData: async (): Promise<any> =>
          persistedSensitiveData,
        persistDebounce: 0,
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(store.getState()).toEqual({
      _persist: { restored: true },
      globalSettings: { theme: 'system' },
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alice',
            databases: {
              currentDatabaseId: null,
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                  password: 'password',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              currentDatabaseId: null,
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                  password: 'password',
                },
              },
            },
          },
        },
      },
    });

    persistedData = JSON.parse(JSON.stringify(persistedData));
    persistedSensitiveData = JSON.parse(JSON.stringify(persistedSensitiveData));

    persistedData.users!.users!.a!.name = 'Alex';
    persistedData.users!.users!.a!.databases!.databases!.b = {
      url: 'https://example.com/db_2',
      username: 'user_2',
    };
    persistedSensitiveData.users!.users!.a!.databases!.databases!.b = {
      password: 'password_2',
    };

    persister.restorePersistedState();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(store.getState()).toEqual({
      _persist: { restored: true },
      globalSettings: { theme: 'system' },
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alex',
            databases: {
              currentDatabaseId: null,
              databases: {
                a: {
                  url: 'https://example.com/db',
                  username: 'user',
                  password: 'password',
                },
                b: {
                  password: 'password_2',
                  url: 'https://example.com/db_2',
                  username: 'user_2',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              currentDatabaseId: null,
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                  password: 'password',
                },
              },
            },
          },
        },
      },
    });

    store.dispatch(
      actions.databases.updateDatabase({
        id: 'a',
        url: 'https://example.com/updated_db',
        password: 'new_password',
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastPersistState).toEqual({
      users: {
        currentUserId: 'a',
        users: {
          a: {
            name: 'Alex',
            databases: {
              databases: {
                a: {
                  url: 'https://example.com/updated_db',
                  username: 'user',
                },
                b: {
                  url: 'https://example.com/db_2',
                  username: 'user_2',
                },
              },
            },
          },
          b: {
            name: 'Bob',
            databases: {
              databases: {
                b: {
                  url: 'https://example.com/db',
                  username: 'user',
                },
              },
            },
          },
        },
      },
    });
    expect(lastPersistSensitiveState).toEqual({
      users: {
        users: {
          a: {
            databases: {
              databases: {
                a: {
                  password: 'new_password',
                },
                b: {
                  password: 'password_2',
                },
              },
            },
          },
          b: {
            databases: {
              databases: {
                b: {
                  password: 'password',
                },
              },
            },
          },
        },
      },
    });
  });
});

describe('rootSlice', () => {
  describe('persistState', () => {
    it('should return a portion of the state that should be persisted', () => {
      const state = {
        globalSettings: {
          theme: 'dark' as const,
        },
        users: {
          currentUserId: '1',
          users: {
            '1': {
              name: 'Alice',
              databases: {
                currentDatabaseId: '1',
                databases: {
                  '1': {
                    url: 'https://example.com',
                    username: 'alice',
                    password: 'password',
                  },
                },
              },
            },
          },
        },
      };

      const result = rootSlice.persistState?.(state);

      expect(result).toEqual({
        globalSettings: {
          theme: 'dark',
        },
        users: {
          currentUserId: '1',
          users: {
            '1': {
              name: 'Alice',
              databases: {
                databases: {
                  '1': {
                    url: 'https://example.com',
                    username: 'alice',
                  },
                },
              },
            },
          },
        },
      });
    });
  });
});
