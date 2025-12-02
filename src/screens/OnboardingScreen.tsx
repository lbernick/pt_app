import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ChatInterface from "../components/ChatInterface";
import { Message as MessageType } from "../types/message";
import { sendOnboardingMessage } from "../services/onboardingApi";
import { OnboardingMessage, OnboardingState } from "../types/onboarding";
import { generateTrainingPlan } from "../services/trainingPlanApi";

type OnboardingStackParamList = {
  Onboarding: { backendUrl: string };
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

export default function OnboardingScreen() {
  const route = useRoute<OnboardingScreenRouteProp>();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { backendUrl } = route.params;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [onboardingHistory, setOnboardingHistory] = useState<
    OnboardingMessage[]
  >([]);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Initial onboarding message on mount
  useEffect(() => {
    if (messages.length === 0) {
      handleOnboardingMessage("");
    }
  }, []);

  const generatePlan = async (state: OnboardingState) => {
    try {
      setIsGeneratingPlan(true);
      setPlanError(null);

      console.log("Generating training plan...");
      await generateTrainingPlan(state, backendUrl);

      console.log("Training plan generated successfully");

      // Navigate to TrainingPlanScreen
      navigation.navigate("TrainingPlan", { backendUrl });
    } catch (error) {
      console.error("Failed to generate training plan:", error);
      setPlanError(
        error instanceof Error ? error.message : "Failed to generate training plan"
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
      const response = await sendOnboardingMessage(
        {
          conversation_history: onboardingHistory,
          latest_message: userText,
        },
        backendUrl
      );

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

      // Update onboarding state
      setOnboardingState(response.state);

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

  // Calculate progress based on collected fields
  const calculateProgress = () => {
    const fields = [
      "fitness_goals",
      "experience_level",
      "current_routine",
      "days_per_week",
      "equipment_available",
      "injuries_limitations",
      "preferences",
    ];
    const completedFields = fields.filter(
      (field) => onboardingState[field as keyof OnboardingState] !== undefined
    ).length;
    return Math.round((completedFields / fields.length) * 100);
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
          <Text style={styles.loadingText}>Generating your training plan...</Text>
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
      {/* Onboarding Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to PT App</Text>
        {!isComplete && (
          <Text style={styles.progressText}>
            Progress: {calculateProgress()}%
          </Text>
        )}
        {isComplete && (
          <Text style={styles.completeText}>Onboarding Complete! ✓</Text>
        )}
      </View>

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
  progressText: {
    fontSize: 14,
    color: COLORS.progressText,
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
