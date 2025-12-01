import {
  GenerateWorkoutRequest,
  Workout,
  WorkoutInstance,
  SetInstance,
} from "../types/workout";

export async function getWorkouts(backendUrl: string): Promise<Workout[]> {
  const apiUrl = `${backendUrl}/api/v1/workouts`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch workouts: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function generateWorkout(
  request: GenerateWorkoutRequest,
  apiUrl: string
): Promise<Workout> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to generate workout: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
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
