import { ApiClient } from "./apiClient";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatResponse {
  role: string;
  content: string;
}

export async function sendMessage(
  messages: ChatMessage[],
  apiUrl: string
): Promise<ChatResponse> {
  return ApiClient.fetchJson<ChatResponse>(apiUrl, {
    method: 'POST',
    body: { messages },
  });
}
