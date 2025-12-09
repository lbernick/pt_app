export interface TemplateExercise {
  name: string;
  sets: number;
  rep_min: number;
  rep_max: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
}

export interface TrainingPlan {
  id: string;
  description?: string;
  templates: Template[];
  microcycle: number[]; // Array of template indices (-1 for rest days)
}
