import { OnboardingRequest, OnboardingResponse } from "../types/onboarding";

export async function sendOnboardingMessage(
  request: OnboardingRequest,
  backendUrl: string
): Promise<OnboardingResponse> {
  const apiUrl = `${backendUrl}/api/v1/onboarding/message`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get onboarding response: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
