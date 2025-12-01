import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import ChatInterface from "../components/ChatInterface";
import { Message as MessageType } from "../types/message";
import { sendOnboardingMessage } from "../services/onboardingApi";
import { OnboardingMessage, OnboardingState } from "../types/onboarding";

type OnboardingScreenRouteProp = RouteProp<
  { Onboarding: { backendUrl: string } },
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
};

export default function OnboardingScreen() {
  const route = useRoute<OnboardingScreenRouteProp>();
  const { backendUrl } = route.params;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [onboardingHistory, setOnboardingHistory] = useState<
    OnboardingMessage[]
  >([]);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initial onboarding message on mount
  useEffect(() => {
    if (messages.length === 0) {
      handleOnboardingMessage("");
    }
  }, []);

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
        console.log("Switching to regular mode...");
        // TODO: Implement mode switching - this would typically require:
        // 1. Saving the onboarding state to persistent storage
        // 2. Navigating to the main app
        // 3. Or reloading with updated config
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
});
