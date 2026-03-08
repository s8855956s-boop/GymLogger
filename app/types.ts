export type Program = {
  id?: string;
  name?: string;
  exercisesForProgram?: ProgramExercise[];
};

export type Log = {
  dateId?: number;
  date?: Date;
  logForExercise?: LogExercise[];
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

export type ProgramExercise = BaseExercise & {
  kind: "program";
  programId?: string;
  sets: SetForProgram[];
};

export const createProgramExercise = (
  id: string,
  programId: string,
  name: string,
  unit: string | null,
  imageUri: string | null,
  sets: SetForProgram[],
): ProgramExercise => ({
  kind: "program",
  id: id,
  programId: programId,
  name: name,
  unit: unit,
  imageUri: imageUri,
  sets: sets,
});

export type LogExercise = BaseExercise & {
  kind: string;
  trainingLogId?: number;
  sets: SetForLog[];
};

export const createLogExerise = (
  id: string,
  trainingLogId: number,
  name: string,
  unit: string | null,
  imageUri: string | undefined | null,
  sets: SetForLog[],
): LogExercise => ({
  kind: "log",
  id: id,
  trainingLogId: trainingLogId,
  name: name,
  unit: unit,
  imageUri: imageUri,
  sets: sets,
});

export type ExerciseUI = ProgramExercise | LogExercise;
