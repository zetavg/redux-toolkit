import { Button, Card, Flex, Text } from '@radix-ui/themes';

import { actions, selectors, useAppDispatch, useAppSelector } from '@/redux';

export default function Counter() {
  const dispatch = useAppDispatch();

  const value = useAppSelector(selectors.counter.value);

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
            onClick={() => dispatch(actions.counter.increment())}
          >
            Increment
          </Button>
          <Button
            color="amber"
            variant="soft"
            onClick={() => dispatch(actions.counter.decrement())}
          >
            Decrement
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
