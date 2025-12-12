import {
  WorkoutApi,
  WorkoutSuggestionsResponse,
  WorkoutExerciseApi,
} from "../types/workout";
import { ApiClient } from "./apiClient";

export async function getWorkouts(
  backendUrl: string,
  date?: string,
): Promise<WorkoutApi[]> {
  const dateParam = date ? `?date=${date}` : "";
  const apiUrl = `${backendUrl}/api/v1/workouts${dateParam}`;
  return ApiClient.fetchJson<WorkoutApi[]>(apiUrl, { method: "GET" });
}

export async function getWorkoutById(
  backendUrl: string,
  workoutId: string,
): Promise<WorkoutApi> {
  const apiUrl = `${backendUrl}/api/v1/workouts/${workoutId}`;
  return ApiClient.fetchJson<WorkoutApi>(apiUrl, { method: "GET" });
}

export async function getWorkoutSuggestions(
  backendUrl: string,
  workoutId: string,
): Promise<WorkoutSuggestionsResponse> {
  const apiUrl = `${backendUrl}/api/v1/workouts/${workoutId}/suggest`;
  return ApiClient.fetchJson<WorkoutSuggestionsResponse>(apiUrl, {
    method: "POST",
  });
}

export async function startWorkout(
  backendUrl: string,
  workoutId: string,
): Promise<WorkoutApi> {
  const apiUrl = `${backendUrl}/api/v1/workouts/${workoutId}/start`;
  return ApiClient.fetchJson<WorkoutApi>(apiUrl, { method: "POST" });
}

export async function finishWorkout(
  backendUrl: string,
  workoutId: string,
): Promise<WorkoutApi> {
  const apiUrl = `${backendUrl}/api/v1/workouts/${workoutId}/finish`;
  return ApiClient.fetchJson<WorkoutApi>(apiUrl, { method: "POST" });
}

export async function cancelWorkout(
  backendUrl: string,
  workoutId: string,
): Promise<WorkoutApi> {
  const apiUrl = `${backendUrl}/api/v1/workouts/${workoutId}/cancel`;
  return ApiClient.fetchJson<WorkoutApi>(apiUrl, { method: "POST" });
}

export async function updateWorkoutExercises(
  backendUrl: string,
  workoutId: string,
  exercises: WorkoutExerciseApi[],
): Promise<WorkoutApi> {
  const apiUrl = `${backendUrl}/api/v1/workouts/${workoutId}/exercises`;
  return ApiClient.fetchJson<WorkoutApi>(apiUrl, {
    method: "PATCH",
    body: { exercises },
  });
}
