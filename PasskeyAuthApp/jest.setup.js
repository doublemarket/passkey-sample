require('react-native-gesture-handler/jestSetup');

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children ?? null,
  }),
}));
