export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function hasTrimmedText(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}
