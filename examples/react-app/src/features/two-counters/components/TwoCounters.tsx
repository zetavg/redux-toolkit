/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Flex } from '@radix-ui/themes';

import { actions, selectors } from '@/redux';

import ReusableCounter from '../../counter/components/ReusableCounter';

export default function TwoCounters() {
  return (
    <Flex
      gap="4"
      direction={{ initial: 'column', xs: 'row' }}
      align={{ initial: 'stretch', xs: 'start' }}
    >
      <Box grow="1">
        <ReusableCounter
          counterActions={actions.counterOne as any}
          counterSelectors={selectors.counterOne as any}
        />
      </Box>

      <Box grow="1">
        <ReusableCounter
          counterActions={actions.counterTwo as any}
          counterSelectors={selectors.counterTwo as any}
        />
      </Box>
    </Flex>
  );
}
