import { useDispatch } from 'react-redux';
import {
  Button,
  Code,
  Dialog,
  Flex,
  Inset,
  Table,
  TableBody,
} from '@radix-ui/themes';

import { actions, selectors, useAppSelector } from '@/redux';

import counterSlice from '../../counter/slice';

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function ManageCountersDialog({ opened, onClose }: Props) {
  const dispatch = useDispatch();
  const counters = useAppSelector(selectors.counters.counters);

  return (
    <Dialog.Root open={opened}>
      <Dialog.Content>
        <Dialog.Title>Manage Counters</Dialog.Title>

        <Inset side="x" my="5">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <TableBody>
              {!!counters &&
                Object.entries(counters)
                  .map(([counterId, counter]) =>
                    counter ? (
                      <Table.Row key={counterId}>
                        <Table.RowHeaderCell>
                          <Code>{counterId}</Code>
                        </Table.RowHeaderCell>
                        <Table.RowHeaderCell>
                          {counter.name}
                        </Table.RowHeaderCell>
                        <Table.Cell>{counter.data.value}</Table.Cell>
                        <Table.Cell>
                          <Flex gap="1">
                            <Button
                              color="green"
                              variant="soft"
                              size="1"
                              onClick={() =>
                                dispatch(
                                  actions.counters.dispatchToCounter({
                                    counterId,
                                    action: counterSlice.actions.increment(),
                                  }),
                                )
                              }
                            >
                              Increment
                            </Button>
                            <Button
                              color="amber"
                              variant="soft"
                              size="1"
                              onClick={() =>
                                dispatch(
                                  actions.counters.dispatchToCounter({
                                    counterId,
                                    action: counterSlice.actions.decrement(),
                                  }),
                                )
                              }
                            >
                              Decrement
                            </Button>
                            <Button
                              variant="soft"
                              size="1"
                              onClick={() => {
                                const name = window.prompt(
                                  'Enter new name',
                                  counter.name,
                                );
                                if (name)
                                  dispatch(
                                    actions.counters.renameCounter({
                                      id: counterId,
                                      name,
                                    }),
                                  );
                              }}
                            >
                              Rename
                            </Button>
                            <Button
                              color="crimson"
                              variant="soft"
                              size="1"
                              onClick={() =>
                                dispatch(
                                  actions.counters.removeCounter(counterId),
                                )
                              }
                            >
                              Delete
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ) : undefined,
                  )
                  .filter((e): e is NonNullable<typeof e> => !!e)}
              <Table.Row>
                <Table.RowHeaderCell></Table.RowHeaderCell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell>
                  <Flex gap="1">
                    <Button
                      color="green"
                      variant="soft"
                      size="1"
                      onClick={() => dispatch(actions.counters.addCounter())}
                    >
                      Add Counter
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
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
