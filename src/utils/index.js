// src/utils/index.js

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {Date} date - La fecha a formatear
 * @returns {string} - Fecha formateada o mensaje de error
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Fecha inválida';
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Valida si un email tiene formato correcto
 * @param {string} email - El email a validar
 * @returns {boolean} - true si es válido, false si no
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calcula el total de un array de números
 * @param {number[]} numbers - Array de números
 * @returns {number} - La suma total
 */
export const calculateTotal = (numbers) => {
  if (!Array.isArray(numbers)) {
    return 0;
  }
  
  return numbers.reduce((total, num) => total + (Number(num) || 0), 0);
};