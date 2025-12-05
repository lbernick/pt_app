import { useState } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import ChatInterface from "../components/ChatInterface";
import { Message as MessageType } from "../types/message";
import { useApiClient } from "../hooks/useApiClient";

type ChatScreenRouteProp = RouteProp<{ Chat: { backendUrl: string } }, "Chat">;

interface ChatResponse {
  role: string;
  content: string;
}

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
  const apiClient = useApiClient();

  const [messages, setMessages] = useState<MessageType[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    // Create user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message to state
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Show loading indicator
      setIsLoading(true);

      // Convert messages to API format
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.sender,
        content: msg.text,
      }));

      // Get AI response from API
      const response = await apiClient.fetchJson<ChatResponse>(apiUrl, {
        method: 'POST',
        body: { messages: apiMessages },
      });

      // Hide loading indicator
      setIsLoading(false);

      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: response.content,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      // Hide loading indicator on error
      setIsLoading(false);

      // Handle error by showing an error message
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <ChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
    />
  );
}
