import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import TrainingPlanScreen from "../screens/TrainingPlanScreen";
import { config } from "../config/env";

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
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
