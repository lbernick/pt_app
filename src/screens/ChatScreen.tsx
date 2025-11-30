import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import Message from "../components/Message";
import ChatInput from "../components/ChatInput";
import { Message as MessageType } from "../types/message";
import { sendMessage } from "../services/chatApi";

type ChatScreenRouteProp = RouteProp<{ Chat: { backendUrl: string } }, "Chat">;

const COLORS = {
  background: "#f5f5f5",
};

// Initial welcome message
const INITIAL_MESSAGES: MessageType[] = [
  {
    id: "1",
    text: "Hello! How can I help you today?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const { backendUrl } = route.params;
  const apiUrl = `${backendUrl}/api/v1/chat`;

  const [messages, setMessages] = useState<MessageType[]>(INITIAL_MESSAGES);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (text: string) => {
    // Create user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message to state
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Scroll to bottom after user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Convert messages to API format
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.sender,
        content: msg.text,
      }));

      // Get AI response from API
      const response = await sendMessage(apiMessages, apiUrl);

      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: response.content,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      // Scroll to bottom after AI message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      // Handle error by showing an error message
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);

      // Scroll to bottom after error message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Messages container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </ScrollView>

      {/* Input container */}
      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
  },
});
