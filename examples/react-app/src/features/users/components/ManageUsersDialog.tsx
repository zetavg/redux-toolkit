import { useDispatch } from 'react-redux';
import {
  Button,
  Dialog,
  Flex,
  Inset,
  Table,
  TableBody,
} from '@radix-ui/themes';

import { actions, selectors, useAppSelector } from '@/redux';

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function ManageUsersDialog({ opened, onClose }: Props) {
  const dispatch = useDispatch();
  const users = useAppSelector(selectors.users.users);

  return (
    <Dialog.Root open={opened}>
      <Dialog.Content>
        <Dialog.Title>Manage Users</Dialog.Title>

        <Inset side="x" my="5">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Counters Count</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <TableBody>
              {!!users &&
                Object.entries(users)
                  .map(([userId, user]) =>
                    user ? (
                      <Table.Row key={userId}>
                        <Table.RowHeaderCell>{user.name}</Table.RowHeaderCell>
                        <Table.Cell>
                          {Object.keys(user.counters.counters).length}
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            color="crimson"
                            variant="soft"
                            size="1"
                            onClick={() =>
                              dispatch(actions.users.removeUser({ userId }))
                            }
                          >
                            Delete
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ) : undefined,
                  )
                  .filter((e): e is NonNullable<typeof e> => !!e)}
            </TableBody>
          </Table.Root>
        </Inset>

        <Flex gap="3" mt="4" justify="end">
          <Button variant="soft" color="gray" onClick={onClose}>
            Close
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
