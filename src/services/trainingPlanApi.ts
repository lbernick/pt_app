import { TrainingPlan } from "../types/trainingplan";
import { OnboardingState } from "../types/onboarding";
import { ApiClient } from "./apiClient";

export async function getTrainingPlan(
  backendUrl: string,
  token?: string
): Promise<TrainingPlan> {
  const apiUrl = `${backendUrl}/api/v1/training-plan`;
  return ApiClient.fetchJson<TrainingPlan>(apiUrl, { method: "GET", token });
}

export async function generateTrainingPlan(
  onboardingState: OnboardingState,
  backendUrl: string,
  token?: string
): Promise<TrainingPlan> {
  const apiUrl = `${backendUrl}/api/v1/generate-training-plan`;
  return ApiClient.fetchJson<TrainingPlan>(apiUrl, {
    method: "POST",
    body: onboardingState,
    token,
  });
}
