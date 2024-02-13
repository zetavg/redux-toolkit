import { Box, Card, Flex, Select, Separator, Text } from '@radix-ui/themes';

import { actions, selectors, useAppDispatch, useAppSelector } from '@/redux';

import { Appearance } from '../slice';

export default function GlobalSettings() {
  return (
    <Card>
      <Text as="div" color="gray" size="1">
        Global Settings
      </Text>
      <Separator orientation="horizontal" size="4" my="3" />
      <Flex align="start" justify="between" gap="9">
        <Box>
          <Text as="p" size="2" weight="medium" mb="0">
            Appearance
          </Text>
          <Text as="p" size="1" color="gray">
            UI appearance.
          </Text>
        </Box>
        <AppearanceSelector />
      </Flex>
    </Card>
  );
}

function AppearanceSelector() {
  const dispatch = useAppDispatch();

  const currentAppearance = useAppSelector(selectors.globalSettings.appearance);

  return (
    <Select.Root
      value={currentAppearance}
      onValueChange={(value) => {
        dispatch(actions.globalSettings.setAppearance(value as Appearance));
      }}
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          <Select.Item value="light">Light</Select.Item>
          <Select.Item value="dark">Dark</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
