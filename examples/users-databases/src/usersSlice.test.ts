import usersSlice from './usersSlice';

describe('persistState', () => {
  it('should return a portion of the state that should be persisted', () => {
    const state = {
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
    };

    const result = usersSlice.persistState?.(state);

    expect(result).toEqual({
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
    });
  });
});

describe('persistSensitiveState', () => {
  it('should return a portion of the state that should be persisted as sensitive data', () => {
    const state = {
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
    };

    const result = usersSlice.persistSensitiveState?.(state);

    expect(result).toEqual({
      users: {
        '1': {
          databases: {
            databases: {
              '1': {
                password: 'password',
              },
            },
          },
        },
      },
    });
  });
});
