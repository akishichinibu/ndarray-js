module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  // globals: {
  //   'ts-jest': {
  //     useESM: true,
  //   },
  // },
  moduleNameMapper: {
    "^src/(.*)": "<rootDir>/src/$1",
  },
};
