import { OnboardingRequest, OnboardingResponse } from "../types/onboarding";
import { ApiClient } from "./apiClient";

export async function sendOnboardingMessage(
  request: OnboardingRequest,
  backendUrl: string
): Promise<OnboardingResponse> {
  const apiUrl = `${backendUrl}/api/v1/onboarding/message`;
  return ApiClient.fetchJson<OnboardingResponse>(apiUrl, {
    method: "POST",
    body: request,
  });
}
