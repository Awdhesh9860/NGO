/**
 * Test Environment Setup & Assertion Helpers
 */

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export function assertEquals<T>(actual: T, expected: T, message: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`Assertion Failed: ${message} (Expected: ${expectedStr}, Got: ${actualStr})`);
  }
}
