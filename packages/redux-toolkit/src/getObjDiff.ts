/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PartialDeep } from 'type-fest';

export const NO_DIFF = Symbol('NO_DIFF');
export const DELETED = Symbol('DELETED');

export const getObjectDiff = <T extends Record<string, unknown>>(
  prev: Record<string, unknown>,
  next: T,
): PartialDeep<T> | typeof NO_DIFF => {
  if (prev === next) return NO_DIFF;

  let diff: undefined | Record<string, unknown>;
  const getDiff = () => {
    if (diff) return diff;

    diff = {};

    Array.from(new Set([...Object.keys(prev), ...Object.keys(next)])).forEach(
      (key) => {
        const prevValue = prev[key];
        const nextValue = next[key];

        if (prevValue === nextValue) return;

        if (
          prevValue &&
          typeof prevValue === 'object' &&
          !Array.isArray(prevValue) &&
          nextValue &&
          typeof nextValue === 'object' &&
          !Array.isArray(nextValue)
        ) {
          const objectDiff = getObjectDiff(
            prevValue as Record<string, unknown>,
            nextValue as Record<string, unknown>,
          );

          if (objectDiff !== NO_DIFF) {
            diff![key] = objectDiff;
          }
          return;
        }

        if (key in next) {
          diff![key] = nextValue;
        } else {
          diff![key] = DELETED;
        }
      },
    );

    return diff;
  };

  return new Proxy(
    {},
    {
      get(_, property) {
        return getDiff()[property as string];
      },
      ownKeys() {
        return Object.keys(getDiff());
      },
      getOwnPropertyDescriptor(_, property) {
        return Object.getOwnPropertyDescriptor(getDiff(), property);
      },
    },
  ) as any;
};

export default getObjectDiff;
