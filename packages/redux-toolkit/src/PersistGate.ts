/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode, useEffect, useState } from 'react';
import React from 'react';

import { Persistor } from './makeRoot';

type Props = {
  persister: Persistor;
  children?: ReactNode | ((bootstrapped: boolean) => ReactNode);
  loading?: ReactNode;
};

export function PersistGate({ persister, children, loading }: Props) {
  const [isStateRestored, setIsStateRestored] = useState(persister.restored);
  useEffect(
    () =>
      persister.subscribeRestored(() => {
        setIsStateRestored(true);
      }),
    [],
  );

  if (typeof children === 'function') {
    return React.createElement(React.Fragment, null, children(isStateRestored));
  }

  if (!isStateRestored) {
    return React.createElement(React.Fragment, null, loading ?? null);
  }

  return React.createElement(React.Fragment, null, children);
}

export default PersistGate;
