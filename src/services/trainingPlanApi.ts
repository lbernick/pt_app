import { TrainingPlan } from "../types/trainingplan";
import { OnboardingState } from "../types/onboarding";

export async function generateTrainingPlan(
  onboardingState: OnboardingState,
  backendUrl: string
): Promise<TrainingPlan> {
  const apiUrl = `${backendUrl}/api/v1/generate-training-plan`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(onboardingState),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to generate training plan: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
