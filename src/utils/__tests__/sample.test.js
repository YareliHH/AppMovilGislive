/* eslint-disable no-undef */
// src/__tests__/sample.test.js

describe('Sample Tests', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should check if array includes value', () => {
    const array = [1, 2, 3, 4, 5];
    expect(array).toContain(3);
  });

  test('should verify string operations', () => {
    const text = 'Hello World';
    expect(text.toLowerCase()).toBe('hello world');
  });
});