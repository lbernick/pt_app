// Testing setup
// @testing-library/react-native v12.4+ includes built-in matchers

jest.mock('@react-native-firebase/app', () => ({
  firebase: {},
}));
