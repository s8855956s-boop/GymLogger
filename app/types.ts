export type ProgramExerciseSet = {
  id: string;
  exerciseId?: string;
  reps?: number;
  weight?: number;
};

export type ProgramExercise = {
  id: string;
  programId: string;
  name: string;
  unit: string | null;
  imageUri?: string | null;
  setRows: ProgramExerciseSet[];
};

export type ExerciseProgramValue = {
  id: string;
  name: string;
  exercises?: ProgramExercise[] | [];
};

export type SetLog = {
  id?: string;
  exerciseLogId?: string;
  reps?: number;
  weight?: number;
};

export type ExerciseLog = {
  id?: string;
  exerciseId?: string;
  trainingLogId?: string;
  name: string;
  unit: string | null;
  imageUri?: string | null;
  sets: SetLog[];
};

export type TrainingDayLog = {
  id?: string;
  date: Date;
  exerciseLogs: ExerciseLog[];
};
