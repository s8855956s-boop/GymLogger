export type TrainingProgram = {
  id?: string;
  name?: string;
  exercisesForProgram?: ExerciseForProgram[];
};

export type TrainingDayLog = {
  dateId?: number;
  date?: Date;
  exercisesForLog?: ExerciseForLog[];
};

export type SetBase = {
  id: string;
  reps?: number;
  weight?: number;
};

export type SetForProgram = SetBase & {
  programExerciseId?: string;
};

export type SetForLog = SetBase & {
  exerciseLogId?: string;
};

export type SetUI = SetForProgram | SetForLog;

export type BaseExercise = {
  id?: string;
  name: string;
  unit: string | null;
  imageUri?: string | null;
  sets: SetBase[];
};

export type ExerciseForProgram = BaseExercise & {
  kind: "program";
  programId?: string;
  sets: SetForProgram[];
};

export const createExerciseForProgram = (
  id: string,
  programId: string,
  name: string,
  unit: string | null,
  imageUri: string | null,
  sets: SetForProgram[],
): ExerciseForProgram => ({
  kind: "program",
  id: id,
  programId: programId,
  name: name,
  unit: unit,
  imageUri: imageUri,
  sets: sets,
});

export type ExerciseForLog = BaseExercise & {
  kind: string;
  trainingLogId?: number;
  sets: SetForLog[];
};

export const createExeriseForLog = (
  id: string,
  trainingLogId: number,
  name: string,
  unit: string | null,
  imageUri: string | undefined | null,
  sets: SetForLog[],
): ExerciseForLog => ({
  kind: "log",
  id: id,
  trainingLogId: trainingLogId,
  name: name,
  unit: unit,
  imageUri: imageUri,
  sets: sets,
});

export type ExerciseUI = ExerciseForProgram | ExerciseForLog;
