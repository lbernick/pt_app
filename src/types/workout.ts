export interface Exercise {
  name: string;
}

export interface Set {
  reps: number;
  weight?: number; // undefined for bodyweight
  rest_seconds?: number;
}

export type SetInstance = Set & {
  completed: boolean;
};

export interface WorkoutExercise {
  exercise: Exercise;
  sets: Set[];
}

export interface WorkoutExerciseInstance {
  exercise: Exercise;
  sets: SetInstance[];
}

export interface GenerateWorkoutRequest {
  prompt: string;
  difficulty: string;
  duration_minutes?: number;
}

export interface Workout {
  exercises: WorkoutExercise[];
  date?: string; // ISO date string (YYYY-MM-DD)
}

export interface WorkoutInstance {
  exercises: WorkoutExerciseInstance[];
  date: string; // ISO date string (YYYY-MM-DD)
  start_time?: string; // Time string (HH:MM)
  end_time?: string; // Time string (HH:MM)
}
