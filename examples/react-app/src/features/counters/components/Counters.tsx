import { memo, useCallback, useEffect, useState } from 'react';
import { Box, Button, Card, Flex, Separator, Text } from '@radix-ui/themes';

import { actions, selectors, useAppDispatch, useAppSelector } from '@/redux';

import Counter from '../../counter/components/Counter';

import CounterItem from './CounterItem';
import ManageCountersDialog from './ManageCountersDialog';

export default function Counters() {
  const dispatch = useAppDispatch();

  const currentCounter = useAppSelector(selectors.counters.currentCounter);
  useEffect(() => {
    if (currentCounter === null) {
      dispatch(actions.counters.initialize());
    }
  }, [dispatch, currentCounter]);

  const currentCounterId = useAppSelector(selectors.counters.currentCounterId);
  const counters = useAppSelector(selectors.counters.counters);

  const [manageCountersDialogOpened, setManageCountersDialogOpened] =
    useState(false);

  return (
    <>
      <Flex
        gap="4"
        className="flex-col content-stretch md:flex-row md:content-start"
      >
        <Box grow="1" className="md:max-w-xs">
          <Card>
            <Flex gap="2" direction="column">
              <Text as="div" color="gray" size="1">
                Counters
              </Text>
              <Flex grow="1" direction="column">
                {!!counters &&
                  Object.entries(counters)
                    .map(([counterId, counter]) =>
                      counter ? (
                        <MemoizedCounterItem
                          key={counterId}
                          counter={counter}
                          counterId={counterId}
                          isActive={counterId === currentCounterId}
                        />
                      ) : undefined,
                    )
                    .filter((e): e is NonNullable<typeof e> => !!e)
                    .flatMap((e, i) => [
                      e,
                      <Separator key={`separator-${i}`} my="2" size="4" />,
                    ])}

                <Flex gap="2" align="center" className="p-1">
                  <Button
                    variant="soft"
                    onClick={() => dispatch(actions.counters.addCounter())}
                  >
                    Add Counter
                  </Button>
                  <Flex className="mx-1" align="center">
                    <Button
                      variant="ghost"
                      onClick={() => setManageCountersDialogOpened(true)}
                    >
                      Manage Counters
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </Box>
        <Box grow="1">
          <Counter />
        </Box>
      </Flex>

      <ManageCountersDialog
        opened={manageCountersDialogOpened}
        onClose={() => setManageCountersDialogOpened(false)}
      />
    </>
  );
}

const MemoizedCounterItem = memo(
  ({
    counterId,
    ...props
  }: {
    counterId: string;
  } & Omit<React.ComponentPropsWithoutRef<typeof CounterItem>, 'onClick'>) => {
    const dispatch = useAppDispatch();

    const handleClick = useCallback(() => {
      dispatch(actions.counters.switchCounter(counterId));
    }, [dispatch, counterId]);

    return <CounterItem {...props} onClick={handleClick} />;
  },
);
MemoizedCounterItem.displayName = 'MemoizedCounterItem';
