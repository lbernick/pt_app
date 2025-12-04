import {
  GenerateWorkoutRequest,
  Workout,
  WorkoutInstance,
  SetInstance,
} from "../types/workout";
import { ApiClient } from "./apiClient";

export async function getWorkouts(backendUrl: string): Promise<Workout[]> {
  const apiUrl = `${backendUrl}/api/v1/workouts`;
  return ApiClient.fetchJson<Workout[]>(apiUrl, { method: "GET" });
}

export async function generateWorkout(
  request: GenerateWorkoutRequest,
  apiUrl: string
): Promise<Workout> {
  return ApiClient.fetchJson<Workout>(apiUrl, {
    method: "POST",
    body: request,
  });
}

export function convertWorkoutToInstance(workout: Workout): WorkoutInstance {
  return {
    date: workout.date || new Date().toISOString().split("T")[0],
    exercises: workout.exercises.map((exercise) => ({
      exercise: exercise.exercise,
      sets: exercise.sets.map(
        (set): SetInstance => ({
          ...set,
          completed: false,
        })
      ),
    })),
  };
}
