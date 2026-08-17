/**
 * Assertion Utilities and Validation Helpers for Test Suite
 * Compatible with Node.js and Browser environments.
 */

export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, false, true);
  }
}

export function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    const msg = message ? `${message} - ` : '';
    throw new AssertionError(`${msg}Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`, actual, expected);
  }
}

export function assertDeepEqual(actual, expected, message = '') {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message ? `${message} - ` : '';
    throw new AssertionError(`${msg}Deep equality mismatch.\nExpected: ${expectedStr}\nGot: ${actualStr}`, actual, expected);
  }
}

export function assertApprox(actual, expected, tolerance = 0.001, message = '') {
  if (typeof actual !== 'number' || typeof expected !== 'number' || isNaN(actual) || isNaN(expected)) {
    throw new AssertionError(`${message} - Expected finite numbers for approx comparison, got actual=${actual}, expected=${expected}`, actual, expected);
  }
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    const msg = message ? `${message} - ` : '';
    throw new AssertionError(`${msg}Difference ${diff} exceeds tolerance ${tolerance}. Actual: ${actual}, Expected: ${expected}`, actual, expected);
  }
}

export function assertInRange(val, min, max, message = '') {
  if (typeof val !== 'number' || isNaN(val) || val < min || val > max) {
    const msg = message ? `${message} - ` : '';
    throw new AssertionError(`${msg}Value ${val} not in range [${min}, ${max}]`, val, [min, max]);
  }
}

export function assertDefined(val, message = 'Value should be defined') {
  if (val === undefined || val === null) {
    throw new AssertionError(message, val, 'defined');
  }
}

export function assertThrows(fn, expectedErrorType = null, message = 'Expected function to throw') {
  let threw = false;
  let thrownError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    thrownError = err;
  }
  if (!threw) {
    throw new AssertionError(message, 'did not throw', 'threw');
  }
  if (expectedErrorType && !(thrownError instanceof expectedErrorType) && thrownError.name !== expectedErrorType.name && thrownError.name !== expectedErrorType) {
    throw new AssertionError(`Expected error of type ${expectedErrorType.name || expectedErrorType}, got ${thrownError}`, thrownError, expectedErrorType);
  }
  return thrownError;
}

export async function assertThrowsAsync(fn, expectedErrorType = null, message = 'Expected async function to throw') {
  let threw = false;
  let thrownError = null;
  try {
    await fn();
  } catch (err) {
    threw = true;
    thrownError = err;
  }
  if (!threw) {
    throw new AssertionError(message, 'did not throw', 'threw');
  }
  if (expectedErrorType && !(thrownError instanceof expectedErrorType) && thrownError.name !== expectedErrorType.name && thrownError.name !== expectedErrorType) {
    throw new AssertionError(`Expected error of type ${expectedErrorType.name || expectedErrorType}, got ${thrownError}`, thrownError, expectedErrorType);
  }
  return thrownError;
}

/**
 * Validates a snapshot against window.__GAME_STATE__ requirements
 */
export function validateGameState(state, expected = {}) {
  assert(state && typeof state === 'object', 'Game state must be a non-null object');
  
  for (const [key, value] of Object.entries(expected)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      assert(state[key] && typeof state[key] === 'object', `Game state key '${key}' must be an object`);
      for (const [subKey, subVal] of Object.entries(value)) {
        assertEqual(state[key][subKey], subVal, `Mismatch at state.${key}.${subKey}`);
      }
    } else {
      assertEqual(state[key], value, `Mismatch at state.${key}`);
    }
  }
  return true;
}

/**
 * Validates LocalStorage JSON Schema for Happy Mrs Chicken
 */
export function validateStorageSchema(data) {
  assert(data && typeof data === 'object', 'Storage root must be an object');
  assertDefined(data.version, 'Storage must contain version');
  assertDefined(data.settings, 'Storage must contain settings');
  assertDefined(data.highScores, 'Storage must contain highScores');
  assertDefined(data.highScores.classic || data.highScores.EGG_LAYING || data.highScores.eggLaying, 'Storage must have egg laying high score');
  return true;
}
