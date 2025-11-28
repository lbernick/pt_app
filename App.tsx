import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from './src/screens/ChatScreen';
import { config } from './src/config/env';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Chat">
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'AI Chat' }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
