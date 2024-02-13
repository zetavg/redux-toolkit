import { DELETED } from './getObjDiff';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function deepMerge<
  T extends Readonly<Record<string, any>>,
  U extends Readonly<Record<string, any>>,
>(
  target: T,
  source: U,
  { preserveDeletedSymbol = false }: { preserveDeletedSymbol?: boolean } = {},
): T & U {
  if (Object.keys(source).length === 0) return target as T & U;

  const output = Object.assign({}, target) as any;
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (typeof value === 'undefined') return;

    if (value === DELETED && !preserveDeletedSymbol) {
      delete output[key];
      return;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        output[key] = deepMerge(target[key], value, { preserveDeletedSymbol });
      } else {
        output[key] = value;
      }
    } else {
      output[key] = value;
    }
  });

  return output as T & U;
}

export default deepMerge;
