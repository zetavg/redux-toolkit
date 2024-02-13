import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Container, Flex, Theme } from '@radix-ui/themes';
import { PersistGate } from '@zetavg/redux-toolkit';

import Counter from './features/counter/components/Counter';
import Counters from './features/counters/components/Counters';
import GlobalSettings from './features/global-settings/components/GlobalSettings';
import TwoCounters from './features/two-counters/components/TwoCounters';
import Users from './features/users/components/Users';
import { actions, persister, selectors, store, useAppSelector } from './redux';

import '@radix-ui/themes/styles.css';

function App() {
  useEffect(() => {
    window.addEventListener('storage', persister.restorePersistedState);
    window.addEventListener('beforeunload', persister.flush);

    return () => {
      window.removeEventListener('storage', persister.restorePersistedState);
      window.removeEventListener('beforeunload', persister.flush);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persister={persister} loading={null}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

function AppContent() {
  const color = useAppSelector(selectors.settings?.color || (() => 'indigo'));
  const appearance = useAppSelector(
    selectors.globalSettings?.appearance || (() => 'light'),
  );

  useEffect(() => {
    if (appearance === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [appearance]);

  return (
    <Theme accentColor={color || 'indigo'} appearance={appearance}>
      <Container size="3" style={{ margin: '16px 8px' }}>
        <Flex direction="column" gap="4">
          {(() => {
            if (actions.users) {
              return <Users />;
            }

            if (actions.counters) {
              return <Counters />;
            }

            if (actions.twoCounters) {
              return <TwoCounters />;
            }

            return <Counter />;
          })()}

          {(() => {
            if (actions.globalSettings) {
              return <GlobalSettings />;
            }

            return null;
          })()}
        </Flex>
      </Container>
    </Theme>
  );
}

export default App;
