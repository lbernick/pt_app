import { ApiClient } from "./apiClient";

export interface OnboardingStatus {
  completed: boolean;
}

export async function getOnboardingStatus(
  backendUrl: string,
  token?: string
): Promise<OnboardingStatus> {
  const apiUrl = `${backendUrl}/api/v1/user/onboarding-status`;
  return ApiClient.fetchJson<OnboardingStatus>(apiUrl, { method: "GET", token });
}
