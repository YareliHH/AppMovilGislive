/* eslint-disable no-undef */
// eslint-disable-next-line import/no-unresolved
import '@testing-library/jest-native/extend-expect';

// Mock de AsyncStorage si lo usas
// eslint-disable-next-line no-undef
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock de expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

// Silenciar warnings específicos
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};