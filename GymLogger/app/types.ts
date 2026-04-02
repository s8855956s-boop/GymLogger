export type Program = {
  id?: string;
  name?: string;
  exercisesForProgram?: ProgramExercise[];
};

export type Log = {
  dateId?: number;
  date?: Date;
  logExercises?: LogExercise[];
  createDate?: Date;
  updateDate?: Date;
};

export type SetBase = {
  id: string;
  reps?: number;
  weight?: number;
  createDate?: Date;
  updateDate?: Date;
};

export type SetForProgram = SetBase & {
  programExerciseId?: string;
};

export type LogSet = SetBase & {
  logExerciseId?: string;
};

export type SetUI = SetForProgram | LogSet;

export type BaseExercise = {
  id?: string;
  name: string;
  unit: string | null;
  imageUri?: string | null;
  sets: SetBase[];
  createDate?: Date;
  updateDate?: Date;
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
  logId?: number;
  sets: LogSet[];
};

export const createLogExerise = (
  id: string,
  logId: number,
  name: string,
  unit: string | null,
  imageUri: string | undefined | null,
  sets: LogSet[],
  createDate?: Date,
  updateDate?: Date,
): LogExercise => ({
  kind: "log",
  id: id,
  logId: logId,
  name: name,
  unit: unit,
  imageUri: imageUri,
  createDate: createDate,
  updateDate: updateDate,
  sets: sets,
});

export type ExerciseUI = ProgramExercise | LogExercise;
