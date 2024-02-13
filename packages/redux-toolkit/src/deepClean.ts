import { PartialDeep } from 'type-fest';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyObject = Record<string, any>;

// Function to check if an value is empty
const isEmpty = (val: unknown): boolean => {
  if (typeof val === 'undefined') return true;
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return false;
    }

    return !!val && Object.keys(val).length === 0;
  }

  return false;
};

export default function deepClean<T>(obj: T): PartialDeep<T> | undefined {
  if (isEmpty(obj)) return undefined;

  if (typeof obj === 'undefined') return obj;
  if (typeof obj !== 'object') return obj as any;
  if (Array.isArray(obj)) return obj as any;
  if (!obj) return obj as any;
  if (Object.keys(obj).length === 0) return obj as any;

  // Iterate over object properties
  const result = Object.entries(obj).reduce((acc, [key, value]) => {
    const cleanedValue = deepClean(value);
    if (typeof cleanedValue !== 'undefined') {
      acc[key] = cleanedValue;
    }
    return acc;
  }, {} as AnyObject);

  if (Object.keys(result).length === 0) return undefined;

  return result as any;
}
