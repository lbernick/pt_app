import { WorkoutApi } from "../types/workout";
import { ApiClient } from "./apiClient";

export async function getWorkouts(
  backendUrl: string,
  date?: string
): Promise<WorkoutApi[]> {
  const dateParam = date ? `?date=${date}` : "";
  const apiUrl = `${backendUrl}/api/v1/workouts${dateParam}`;
  return ApiClient.fetchJson<WorkoutApi[]>(apiUrl, { method: "GET" });
}
