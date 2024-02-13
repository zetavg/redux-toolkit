import { memo, useEffect, useState } from 'react';
import { Button, Card, Flex, Text } from '@radix-ui/themes';

import { actions, selectors, useAppDispatch, useAppSelector } from '@/redux';

import Counters from '../../counters/components/Counters';
import Settings from '../../settings/components/Settings';

import AddUserDialog from './AddUserDialog';
import ManageUsersDialog from './ManageUsersDialog';
import UserSelector from './UserSelector';

function Users() {
  const dispatch = useAppDispatch();

  const currentUserName = useAppSelector(selectors.users.currentUserName);
  useEffect(() => {
    if (typeof currentUserName !== 'string') {
      dispatch(actions.users.initialize());
    }
  }, [dispatch, currentUserName]);

  const [addUserDialogOpened, setAddUserDialogOpened] = useState(false);
  const [manageUsersDialogOpened, setManageUsersDialogOpened] = useState(false);

  return (
    <>
      <Flex gap="4" direction="column" align="stretch">
        <Card>
          <Flex gap="2" direction="column">
            <Text as="div" color="gray" size="1">
              Users
            </Text>
            <Flex gap="2" direction="row" align="center">
              <Flex grow="1" direction="column" align="stretch">
                <UserSelector />
              </Flex>
              <Button
                size="2"
                variant="soft"
                onClick={() => setAddUserDialogOpened(true)}
              >
                Add User
              </Button>
              <Flex className="mx-1" align="center">
                <Button
                  size="2"
                  variant="ghost"
                  onClick={() => setManageUsersDialogOpened(true)}
                >
                  Manage Users
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Card>
        <Counters />
        <Settings />
      </Flex>

      <AddUserDialog
        opened={addUserDialogOpened}
        onClose={() => setAddUserDialogOpened(false)}
      />

      <ManageUsersDialog
        opened={manageUsersDialogOpened}
        onClose={() => setManageUsersDialogOpened(false)}
      />
    </>
  );
}

export default memo(Users);
