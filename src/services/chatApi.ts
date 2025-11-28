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
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
