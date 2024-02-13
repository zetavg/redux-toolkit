import { memo } from 'react';
import { Box, Card, Flex, Select, Separator, Text } from '@radix-ui/themes';

import { actions, selectors, useAppDispatch, useAppSelector } from '@/redux';

import { COLORS, isValidColor } from '../slice';

function Settings() {
  return (
    <Card>
      <Text as="div" color="gray" size="1">
        Settings
      </Text>
      <Separator orientation="horizontal" size="4" my="3" />
      <Flex align="start" justify="between" gap="9">
        <Box>
          <Text as="p" size="2" weight="medium" mb="0">
            Color
          </Text>
          <Text as="p" size="1" color="gray">
            The UI color theme.
          </Text>
        </Box>
        <ColorSelector />
      </Flex>
    </Card>
  );
}

function ColorSelector() {
  const dispatch = useAppDispatch();

  const currentColor = useAppSelector(selectors.settings.color);

  return (
    <Select.Root
      value={currentColor}
      onValueChange={(value) => {
        if (!isValidColor(value)) return;
        dispatch(actions.settings.setColor(value));
      }}
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          {COLORS.map((color) => (
            <Select.Item key={color} value={color}>
              {color}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}

export default memo(Settings);
