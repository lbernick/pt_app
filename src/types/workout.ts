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

export interface Workout {
  exercises: WorkoutExercise[];
}

export interface WorkoutInstance {
  exercises: WorkoutExerciseInstance[];
}
