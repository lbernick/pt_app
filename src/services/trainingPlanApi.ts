import { TrainingPlan } from "../types/trainingplan";
import { OnboardingState } from "../types/onboarding";
import { ApiClient } from "./apiClient";

export async function getTrainingPlan(
  backendUrl: string
): Promise<TrainingPlan> {
  const apiUrl = `${backendUrl}/api/v1/training-plan`;
  return ApiClient.fetchJson<TrainingPlan>(apiUrl, { method: "GET" });
}

export async function generateTrainingPlan(
  onboardingState: OnboardingState,
  backendUrl: string
): Promise<TrainingPlan> {
  const apiUrl = `${backendUrl}/api/v1/generate-training-plan`;
  return ApiClient.fetchJson<TrainingPlan>(apiUrl, {
    method: "POST",
    body: onboardingState,
  });
}
