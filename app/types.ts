export type ExerciseProgramValue = {
  id: string;
  name: string;
  exercises?: Exercise[] | [];
};

export type TrainingDayLog = {
  dateId?: number;
  date?: Date;
  exerciseLogs?: Exercise[];
};

export type Set = {
  isSetLog: boolean; // 當true時實際上是資料庫set_log表資料
  isProgramSet: boolean; // 當true時實際上是資料庫program_set表資料
  setLogId?: string | false; // 代表為set_log時的id
  programSetId?: string | false; // 代表為program(課表)set時的id
  exerciseLogId?: string; // 關聯exercise_log的id
  programExerciseId?: string; // 關聯program_exercise的id
  reps?: number;
  weight?: number;
};

export const createSet = (overrides: Partial<Set> = {}): Set => ({
  isSetLog: false,
  isProgramSet: false,
  ...overrides,
});

export type Exercise = {
  isExerciseLog: boolean; // 當true時實際上是資料庫exercise_log表資料
  isProgramExercise: boolean; // 當true時實際上是資料庫program_exercise表資料
  exserciseLogId?: string; // 代表為exercise_log時的id
  programExerciseId?: string; // 代表為program_exercise時的id
  trainingLogDateId?: number; // 關聯training_log的id
  programId?: string; // 關聯program的id
  name?: string;
  unit?: string | null;
  imageUri?: string | null;
  sets?: Set[];
};

export const createExercise = (
  overrides: Partial<Exercise> = {},
): Exercise => ({
  isExerciseLog: false,
  isProgramExercise: false,
  ...overrides,
});
