import { Button, Card, Flex, Text } from '@radix-ui/themes';
import { SelectorsWithInput } from '@zetavg/redux-toolkit';

import { RootState, useAppDispatch, useAppSelector } from '@/redux';

import counterSlice from '../slice';

type Props = {
  counterSelectors: SelectorsWithInput<
    ReturnType<typeof counterSlice.getSelectors>,
    RootState
  >;
  counterActions: typeof counterSlice.actions;
};

export default function ReusableCounter({
  counterSelectors,
  counterActions,
}: Props) {
  const dispatch = useAppDispatch();

  const value = useAppSelector(counterSelectors.value);

  return (
    <Card>
      <Text as="div" color="gray" size="1">
        Counter
      </Text>
      <Flex direction="column" gap="2">
        <Text as="div" weight="medium" color="gray" size="8">
          {value}
        </Text>
        <Flex gap="2">
          <Button
            color="green"
            onClick={() => dispatch(counterActions.increment())}
          >
            Increment
          </Button>
          <Button
            color="crimson"
            variant="soft"
            onClick={() => dispatch(counterActions.decrement())}
          >
            Decrement
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
