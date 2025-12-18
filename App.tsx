import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import TrainingPlanScreen from "./src/screens/TrainingPlanScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import { config, safeConfig } from "./src/config/env";
import { getTrainingPlan } from "./src/services/trainingPlanApi";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import LogoutButton from "./src/components/LogoutButton";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORS = {
  white: "#FFFFFF",
  loadingIndicator: "#007AFF",
};

interface OnboardingAppProps {
  onPlanCreated: () => void;
}

function OnboardingApp({ onPlanCreated }: OnboardingAppProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerRight: () => <LogoutButton />,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ title: "Get Started" }}
          initialParams={{
            backendUrl: config.backendUrl,
            onPlanCreated: onPlanCreated,
          }}
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
      <Tab.Navigator
        screenOptions={{
          headerRight: () => <LogoutButton />,
        }}
      >
        <Tab.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{
            title: "Today's Workout",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="fitness-center" size={size} color={color} />
            ),
          }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
        <Tab.Screen
          name="Plan"
          component={TrainingPlanScreen}
          options={{
            title: "Training Plan",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="event-note" size={size} color={color} />
            ),
          }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="history" size={size} color={color} />
            ),
          }}
          initialParams={{ backendUrl: config.backendUrl }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
});

export function AppContent() {
  const { user, getIdToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkForTrainingPlan();
    } else {
      setHasPlan(false);
      setIsLoading(false);
    }
  }, [user]);

  const checkForTrainingPlan = async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      await getTrainingPlan(config.backendUrl, token || undefined);
      // Plan exists
      setHasPlan(true);
    } catch (error) {
      // 404 or other error - assume no plan
      console.log("No training plan found, showing onboarding", error);
      setHasPlan(false);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Starting app with config:", safeConfig);

  // Show loading spinner while checking for plan
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.loadingIndicator}
          testID="loading-indicator"
        />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  // Show onboarding if no plan exists
  if (hasPlan === false) {
    return <OnboardingApp onPlanCreated={() => setHasPlan(true)} />;
  }

  // Show regular app if plan exists
  return <RegularApp />;
}

export default function App() {
  console.log("Starting app with config:", safeConfig);
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
