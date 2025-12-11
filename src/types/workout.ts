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
  notes: string | null;
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
  id: string;
  template_id?: string;
  exercises: WorkoutExercise[];
  date?: string; // ISO date string (YYYY-MM-DD)
}

export interface WorkoutInstance {
  id: string;
  template_id?: string;
  exercises: WorkoutExerciseInstance[];
  date: string; // ISO date string (YYYY-MM-DD)
  start_time?: string; // Time string (HH:MM)
  end_time?: string; // Time string (HH:MM)
}

// New API response types matching backend structure
export interface WorkoutExerciseApi {
  name: string; // Direct string instead of nested exercise object
  target_sets: number;
  target_rep_min: number;
  target_rep_max: number;
  sets: SetInstance[]; // Sets include completed and notes
  notes: string | null;
}

export interface WorkoutApi {
  id: string;
  template_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  start_time: string | null;
  end_time: string | null;
  exercises: WorkoutExerciseApi[];
  created_at: string;
  updated_at: string;
}
