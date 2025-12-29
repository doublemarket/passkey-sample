module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^config/local\\.json$': '<rootDir>/__mocks__/config/local.json',
  },
};
