export interface OnboardingMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OnboardingRequest {
  conversation_history: OnboardingMessage[];
  latest_message: string;
}

export interface OnboardingState {
  fitness_goals?: string[];
  experience_level?: string;
  current_routine?: string;
  days_per_week?: number;
  equipment_available?: string[];
  injuries_limitations?: string[];
  preferences?: string;
}

export interface OnboardingResponse {
  message: string;
  is_complete: boolean;
  state: OnboardingState;
}
