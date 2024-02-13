import { Avatar, Box, Card, Flex, Inset, Text } from '@radix-ui/themes';

import { cn } from '@/lib/utils';

import { CountersState } from '../slice';

type Props = {
  counter: NonNullable<CountersState['counters'][string]>;
  onClick: () => void;
  isActive: boolean;
};

export default function CounterItem({ counter, onClick, isActive }: Props) {
  return (
    <Card
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      asChild
      variant={isActive ? 'surface' : 'ghost'}
      className={cn('border border-transparent', {
        'bg-accent-a3': isActive,
      })}
    >
      <a href="#" className="m-0">
        <Inset m="1">
          <Flex gap="2">
            <Avatar fallback={counter.data.value} />
            <Box>
              <Text as="div" weight="bold" size="2">
                {counter.name}
              </Text>
              <Text size="2">
                <Flex gap="2" align="center">
                  Value: {counter.data.value}
                </Flex>
              </Text>
            </Box>
          </Flex>
        </Inset>
      </a>
    </Card>
  );
}
