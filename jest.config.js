/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',               // keeps Expo RN defaults
  roots: ['<rootDir>/src'],          // look for tests inside src
  testEnvironment: 'node',           // we’re testing a plain API fn
  transform: {                       // let Babel compile .ts/.tsx
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts','tsx','js','jsx'],
};