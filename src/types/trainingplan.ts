export interface Template {
  id: string;
  name: string;
  description?: string;
  exercises: string[];
}

export interface TrainingPlan {
  id: string;
  description?: string;
  templates: Template[];
  microcycle: number[]; // Array of template indices (-1 for rest days)
}
