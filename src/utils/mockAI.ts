// Mock AI response generator
const AI_RESPONSES = [
  "That's a great question! Let me help you with that.",
  "I understand. Based on what you've told me, I'd recommend focusing on progressive overload and consistency.",
  "Excellent! Let's break that down into manageable steps.",
  "That's very common. Many people experience the same thing. Here's what I suggest...",
  "Good thinking! Have you considered tracking your progress to stay motivated?",
  "I see. It's important to listen to your body and rest when needed.",
  "Perfect! Nutrition plays a huge role in achieving your goals. Make sure you're eating enough protein.",
  "That makes sense. Let's create a plan that works with your schedule.",
  "Great progress! Keep up the good work and remember to stay consistent.",
  "I'd recommend starting slow and gradually increasing intensity to avoid injury.",
];

export const generateMockAIResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * AI_RESPONSES.length);
  return AI_RESPONSES[randomIndex];
};

export const AI_RESPONSE_DELAY = 1000; // 1 second delay to simulate thinking
