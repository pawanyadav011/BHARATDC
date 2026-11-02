/**
 * Utility functions for mapping between database snake_case and frontend camelCase
 */

function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (group) => `_${group.toLowerCase()}`);
}

/**
 * Converts object keys from snake_case to camelCase
 */
export function toCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as unknown as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      newObj[camelKey] = toCamelCase(value);
    }
    return newObj as T;
  }

  return obj as T;
}

/**
 * Converts object keys from camelCase to snake_case
 */
export function toSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as unknown as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      newObj[snakeKey] = toSnakeCase(value);
    }
    return newObj as T;
  }

  return obj as T;
}
