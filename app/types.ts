export type SetRow = {
  id: string;
  reps: string;
  weight: string;
};

export type ExerciseValue = {
  id?: string;
  name: string;
  unit: string | null;
  imageUri?: string | null;
  setRows: SetRow[];
};

export type ExerciseProgramValue = {
  id: string;
  name: string;
};
