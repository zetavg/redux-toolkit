import { DELETED } from './getObjDiff';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mapObjectValues = <
  T extends Record<string, any>,
  FN extends <K extends keyof T>(value: T[K], key: Exclude<K, number>) => any,
>(
  obj: T,
  fn: FN,
): {
  [K in keyof T]: FN extends (value: T[K], key: K) => infer R
    ? Exclude<R, undefined>
    : never;
} => {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => [k, v === DELETED ? v : fn(v, k)])
      .filter(([, v]) => v !== undefined),
  ) as any;
};

export default mapObjectValues;
