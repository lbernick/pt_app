import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from './src/screens/ChatScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import { config } from './src/config/env';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{ title: "Today's Workout" }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'AI Chat' }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
