import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "./src/screens/ChatScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import TrainingPlanScreen from "./src/screens/TrainingPlanScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import { config } from "./src/config/env";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OnboardingApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ title: "Get Started" }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
        <Stack.Screen
          name="TrainingPlan"
          component={TrainingPlanScreen}
          options={{ title: "Your Plan", headerBackTitle: "Back" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function RegularApp() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{ title: "Today's Workout" }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
        <Tab.Screen
          name="Plan"
          component={TrainingPlanScreen}
          options={{ title: "Training Plan" }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: "History" }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: "AI Chat" }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  console.log("Starting app with config:", config);
  if (config.appMode === "onboarding") {
    return <OnboardingApp />;
  }

  return <RegularApp />;
}
