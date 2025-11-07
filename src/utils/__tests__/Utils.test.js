/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
// src/utils/__tests__/Utils.test.js
import { formatDate, validateEmail, calculateTotal } from '../index';

describe('Utils Functions', () => {
  describe('formatDate', () => {
    test('debería formatear la fecha correctamente', () => {
      const date = new Date('2025-01-15T00:00:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('debería manejar fechas inválidas', () => {
      expect(formatDate(null)).toBe('Fecha inválida');
      expect(formatDate(undefined)).toBe('Fecha inválida');
      expect(formatDate('invalid')).toBe('Fecha inválida');
    });

    test('debería manejar fechas válidas', () => {
      const date = new Date(2025, 0, 15); // Enero es 0
      expect(formatDate(date)).toBe('15/01/2025');
    });
  });

  describe('validateEmail', () => {
    test('debería validar emails correctos', () => {
      expect(validateEmail('test@example.commm')).toBe(true);
      expect(validateEmail('user.name@domain.co')).toBe(true);
      expect(validateEmail('name+tag@example.com')).toBe(true);
    });

    test('debería rechazar emails inválidos', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });
  });

  describe('calculateTotal', () => {
    test('debería calcular el total de un array de números', () => {
      expect(calculateTotal([10, 20, 30])).toBe(60);
      expect(calculateTotal([1, 2, 3, 4, 5])).toBe(15);
    });

    test('debería retornar 0 para array vacío', () => {
      expect(calculateTotal([])).toBe(0);
    });

    test('debería manejar valores no numéricos', () => {
      expect(calculateTotal([10, 'invalid', 20])).toBe(30);
      expect(calculateTotal([10, null, 20])).toBe(30);
      expect(calculateTotal([10, undefined, 20])).toBe(30);
    });

    test('debería manejar inputs inválidos', () => {
      expect(calculateTotal(null)).toBe(0);
      expect(calculateTotal(undefined)).toBe(0);
      expect(calculateTotal('not an array')).toBe(0);
    });
  });
});