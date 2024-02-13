import { memo } from 'react';
import { shallowEqual } from 'react-redux';
import { Select } from '@radix-ui/themes';

import { actions, selectors, useAppDispatch, useAppSelector } from '@/redux';

function UserSelector() {
  const dispatch = useAppDispatch();

  const currentUserId = useAppSelector(selectors.users.currentUserId);
  const userNames = useAppSelector(selectors.users.userNames, (a, b) =>
    shallowEqual(a, b),
  );

  return (
    <Select.Root
      value={currentUserId || ''}
      onValueChange={(value) =>
        dispatch(actions.users.switchUser({ userId: value }))
      }
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          {!!userNames &&
            Object.entries(userNames)
              .map(([userId, userName]) =>
                userName ? (
                  <Select.Item key={userId} value={userId}>
                    {userName}
                  </Select.Item>
                ) : undefined,
              )
              .filter((e): e is NonNullable<typeof e> => !!e)}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}

export default memo(UserSelector);
