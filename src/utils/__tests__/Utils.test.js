/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
// src/utils/__tests__/utils.test.js
import { formatDate, validateEmail, calculateTotal } from '../index';

describe('Utils Functions', () => {
  describe('formatDate', () => {
    test('debería formatear la fecha correctamente', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('15/01/2025');
    });

    test('debería manejar fechas inválidas', () => {
      expect(formatDate(null)).toBe('Fecha inválida');
    });
  });

  describe('validateEmail', () => {
    test('debería validar emails correctos', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co')).toBe(true);
    });

    test('debería rechazar emails inválidos', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('calculateTotal', () => {
    test('debería calcular el total de un array de números', () => {
      expect(calculateTotal([10, 20, 30])).toBe(60);
    });

    test('debería retornar 0 para array vacío', () => {
      expect(calculateTotal([])).toBe(0);
    });
  });
});