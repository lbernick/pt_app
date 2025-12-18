import { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ChatInterface from "../components/ChatInterface";
import { Message as MessageType } from "../types/message";
import { useApiClient } from "../hooks/useApiClient";
import {
  OnboardingMessage,
  OnboardingState,
  OnboardingResponse,
} from "../types/onboarding";
import { TrainingPlan } from "../types/trainingplan";

type OnboardingStackParamList = {
  Onboarding: { backendUrl: string; onPlanCreated?: () => void };
  TrainingPlan: { backendUrl: string };
};

type OnboardingScreenRouteProp = RouteProp<
  OnboardingStackParamList,
  "Onboarding"
>;

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "Onboarding"
>;

const COLORS = {
  background: "#f5f5f5",
  headerBg: "#fff",
  headerText: "#333",
  progressText: "#666",
  completeText: "#34C759",
  borderColor: "#e0e0e0",
  shadowColor: "#000",
  errorText: "#FF3B30",
};

const INITIAL_MESSAGE =
  "Hi! I'm your personal trainer. What are your fitness goals?";

export default function OnboardingScreen() {
  const route = useRoute<OnboardingScreenRouteProp>();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { backendUrl, onPlanCreated } = route.params;
  const apiClient = useApiClient();

  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "initial",
      text: INITIAL_MESSAGE,
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [onboardingHistory, setOnboardingHistory] = useState<
    OnboardingMessage[]
  >([{ role: "assistant", content: INITIAL_MESSAGE }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const generatePlan = async (state: OnboardingState) => {
    try {
      setIsGeneratingPlan(true);
      setPlanError(null);

      console.log("Generating training plan...");
      const apiUrl = `${backendUrl}/api/v1/generate-training-plan`;
      await apiClient.fetchJson<TrainingPlan>(apiUrl, {
        method: "POST",
        body: state,
      });

      console.log("Training plan generated successfully");

      // Call the callback to transition to RegularApp
      if (onPlanCreated) {
        onPlanCreated();
      } else {
        // Fallback: navigate to TrainingPlanScreen (for backwards compatibility)
        navigation.navigate("TrainingPlan", { backendUrl });
      }
    } catch (error) {
      console.error("Failed to generate training plan:", error);
      setPlanError(
        error instanceof Error
          ? error.message
          : "Failed to generate training plan",
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleOnboardingMessage = async (userText: string) => {
    try {
      // If there's user text, add it to messages and history
      if (userText) {
        const userMessage: MessageType = {
          id: Date.now().toString(),
          text: userText,
          sender: "user",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
      }

      // Show loading indicator
      setIsLoading(true);

      // Call onboarding API
      const apiUrl = `${backendUrl}/api/v1/onboarding/message`;
      const response = await apiClient.fetchJson<OnboardingResponse>(apiUrl, {
        method: "POST",
        body: {
          conversation_history: onboardingHistory,
          latest_message: userText,
        },
      });

      // Hide loading indicator
      setIsLoading(false);

      // Add assistant response to messages
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      // Update onboarding history
      const updatedHistory: OnboardingMessage[] = [...onboardingHistory];
      if (userText) {
        updatedHistory.push({ role: "user", content: userText });
      }
      updatedHistory.push({ role: "assistant", content: response.message });
      setOnboardingHistory(updatedHistory);

      // Check if onboarding is complete
      if (response.is_complete) {
        setIsComplete(true);
        console.log("Onboarding complete! State:", response.state);

        // Generate training plan
        await generatePlan(response.state);
      }
    } catch (error) {
      // Hide loading indicator on error
      setIsLoading(false);

      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  // Show loading state while generating plan
  if (isGeneratingPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to PT App</Text>
          <Text style={styles.completeText}>Onboarding Complete! ✓</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Generating your training plan...
          </Text>
        </View>
      </View>
    );
  }

  // Show error if plan generation failed
  if (planError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to PT App</Text>
          <Text style={styles.completeText}>Onboarding Complete! ✓</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {planError}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chat Interface */}
      <View style={styles.chatContainer}>
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleOnboardingMessage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.headerBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.headerText,
    marginBottom: 4,
  },
  completeText: {
    fontSize: 14,
    color: COLORS.completeText,
    fontWeight: "600",
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.progressText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.errorText,
    textAlign: "center",
  },
});
