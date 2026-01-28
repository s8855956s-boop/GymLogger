import * as SQLite from "expo-sqlite";
import {
  createExerciseForProgram,
  createExeriseForLog,
  ExerciseForProgram,
  SetForLog,
  type ExerciseForLog,
  type TrainingDayLog,
  type TrainingProgram,
} from "./types";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
export const getDb = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("gymlogger.db");
  }
  return dbPromise;
};

export const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const initDb = async () => {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS training_program (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exercise_for_program (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT,
      name TEXT NOT NULL,
      unit TEXT,
      image_uri TEXT,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS set_for_program (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT,
      reps INTEGER,
      weight INTEGER,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS set_log (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_log_id TEXT,
      reps INTEGER,
      weight INTEGER,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exercise_for_log (
      id TEXT PRIMARY KEY NOT NULL,
      training_log_id TEXT,
      name TEXT NOT NULL,
      unit TEXT,
      image_uri TEXT,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS training_day_log (
      date_id INTEGER PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
  `);
};

export const listPrograms = async (): Promise<TrainingProgram[]> => {
  const db = await getDb();
  return (await db.getAllAsync(
    "SELECT id, name FROM program ORDER BY create_time DESC;",
  )) as TrainingProgram[];
};

export const createProgram = async (name: string): Promise<TrainingProgram> => {
  const db = await getDb();
  const id = createId("program");
  await db.runAsync(
    "INSERT INTO program (id, name, create_time, update_time) VALUES (?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
    [id, name],
  );
  return { id, name };
};

export const getTrainingDayLogByDate = async (
  date: number,
): Promise<TrainingDayLog> => {
  const db = await getDb();

  type ExerciseSets = {
    id: string;
    exerciseLogId: string;
    trainingLogId: number;
    name: string;
    unit: string;
    imageUri: string;
    reps: string;
    weight: string;
  };
  const queryResults = (await db.getAllAsync(
    `
  SELECT
    el.id AS exerciseLogId, el.training_log_id AS trainingLogId, el.name, el.unit, el.image_uri AS imageUri, sl.reps, sl.weight
  FROM
    training_day_log tdl
  LEFT JOIN exercise_for_log el ON tdl.date_id = el.training_log_id
  LEFT JOIN set_log sl ON el.id = sl.exercise_log_id
  WHERE tdl.date_id = ?
  `,
    [date],
  )) as ExerciseSets[];
  if (queryResults.length < 1) return {};

  const distinctTrainingLogId = queryResults[0].trainingLogId;

  let filteredResults = queryResults.filter(
    (result) => result.trainingLogId === distinctTrainingLogId,
  );
  const groupedByExerciseId = new Map<string, ExerciseSets[]>();

  for (const exerciseSet of filteredResults) {
    if (!groupedByExerciseId.has(exerciseSet.exerciseLogId))
      groupedByExerciseId.set(exerciseSet.exerciseLogId, []);
    groupedByExerciseId.get(exerciseSet.exerciseLogId)!.push(exerciseSet);
  }

  let exercisesForLog: ExerciseForLog[] = [];
  for (const key of groupedByExerciseId.keys()) {
    const exerciseSets = groupedByExerciseId.get(key);
    if (exerciseSets === undefined) continue;
    const setRows = exerciseSets?.map((set) => {
      return {
        id: set.id,
        exerciseLogId: set.exerciseLogId,
        reps: set.reps == null ? undefined : Number(set.reps),
        weight: set.weight == null ? undefined : Number(set.weight),
      };
    });

    exercisesForLog.push(
      createExeriseForLog(
        exerciseSets[0].id,
        exerciseSets[0].trainingLogId,
        exerciseSets[0].name,
        exerciseSets[0].unit,
        exerciseSets[0].imageUri,
        setRows,
      ),
    );
  }

  return {
    dateId: distinctTrainingLogId,
    date: new Date(date),
    exercisesForLog: exercisesForLog,
  };
};

export const getExercisesForProgramByProgramId = async (
  programId: string,
): Promise<ExerciseForProgram[]> => {
  const db = await getDb();
  const exercises = (await db.getAllAsync(
    "SELECT id, program_id AS programId, name, unit, image_uri AS imageUri FROM exercise_for_program WHERE program_id = ? ORDER BY create_time DESC",
    [programId],
  )) as {
    id: string;
    programId: string;
    name: string;
    unit: string | null;
    imageUri: string | null;
  }[];

  const exerciseIds = exercises.map((exercise) => exercise.id);
  const setRows =
    exerciseIds.length === 0
      ? []
      : ((await db.getAllAsync(
          `SELECT id, exercise_id AS programExerciseId, reps, weight
           FROM set_for_program
           WHERE exercise_id IN (${exerciseIds.map(() => "?").join(", ")})
           ORDER BY position ASC`,
          exerciseIds,
        )) as {
          id: string;
          programExerciseId?: string;
          reps?: number;
          weight?: number;
        }[]);

  return exercises.map((exercise) => {
    const filteredRows = setRows.filter(
      (row) => row.programExerciseId === exercise.id,
    );

    return createExerciseForProgram(
      exercise.id,
      exercise.programId,
      exercise.name,
      exercise.unit,
      exercise.imageUri,
      filteredRows,
    );
  });
};

export const saveProgramExercise = async (
  id: string,
  programId: string,
  value: ExerciseForProgram,
): Promise<string> => {
  const db = await getDb();
  const programExerciseId = id ?? createId("programExercise");
  const existing = (await db.getFirstAsync(
    "SELECT id FROM program_exercise WHERE id = ?",
    [programExerciseId],
  )) as { id: string } | undefined;

  if (existing) {
    await db.runAsync(
      "UPDATE program_exercise SET name = ?, unit = ?, image_uri = ?, update_time = (strftime('%s','now') * 1000) WHERE id = ?",
      [value.name, value.unit, value.imageUri ?? null, programExerciseId],
    );
  } else {
    await db.runAsync(
      "INSERT INTO exercises (id, program_id, name, unit, image_uri, create_time, update_time) VALUES (?, ?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
      [
        programExerciseId,
        programId,
        value.name,
        value.unit,
        value.imageUri ?? null,
      ],
    );
  }

  await db.runAsync("DELETE FROM set_log WHERE exercise_id = ?", [
    programExerciseId,
  ]);
  await Promise.all(
    value.sets.map(async (row, index) => {
      const setId = row.id || createId("set");
      await db.runAsync(
        "INSERT INTO set_log (id, exercise_id, reps, weight, position, create_time, update_time) VALUES (?, ?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
        [setId, programExerciseId, row.reps ?? "", row.weight ?? "", index],
      );
    }),
  );

  return programExerciseId;
};

export const deleteExercise = async (exerciseId: string) => {
  const db = await getDb();
  await db.runAsync("DELETE FROM set_log WHERE exercise_id = ?", [exerciseId]);
  await db.runAsync("DELETE FROM exercise_for_log WHERE id = ?", [exerciseId]);
};

export const saveExerciseLogs = async (values: ExerciseForLog[]) => {
  const db = await getDb();
  await Promise.all(
    values.map(async (value) => {
      await db.runAsync(
        `INSERT INTO exercise_for_log (id, training_log_id, name, unit, image_uri, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))
      ON CONFLICT(id) DO UPDATE SET
        training_log_id = excluded.training_log_id,
        name = excluded.name,
        unit = excluded.unit,
        image_uri = excluded.image_uri,
        update_time = (strftime('%s','now') * 1000)`,
        [
          value.id ?? null,
          value.trainingLogId ?? null,
          value.name,
          value.unit,
          value.imageUri ?? null,
        ],
      );
    }),
  );
};

export const saveSetLogs = async (
  values: SetForLog[],
  exerciseLogId?: string,
) => {
  const db = await getDb();
  await Promise.all(
    values.map(async (value) => {
      await db.runAsync(
        `INSERT INTO set_log (id, exercise_log_id, reps, weight, create_time, update_time)
      VALUES (?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))
      ON CONFLICT(id) DO UPDATE SET
        id = excluded.id,
        exercise_log_id = excluded.exercise_log_id,
        reps = excluded.reps,
        weight = excluded.weight,
        update_time = (strftime('%s','now') * 1000)`,
        [
          value.id ?? null,
          exerciseLogId ?? null,
          value.reps ?? null,
          value.weight ?? null,
        ],
      );
    }),
  );
};

export const saveExerciseLogsWithSets = async (
  exerciseLogs: ExerciseForLog[],
) => {
  await saveExerciseLogs(exerciseLogs);
  await Promise.all(
    exerciseLogs.map((exerciseLog) =>
      saveSetLogs(exerciseLog.sets, exerciseLog.id),
    ),
  );
};

export const saveTraningDayLog = async (value: TrainingDayLog) => {
  const db = await getDb();
  const trainingDayLogId = value.dateId ?? null;
  const exists = (await db.getFirstAsync(
    "SELECT date_id FROM training_day_log WHERE date_id = ?",
    [trainingDayLogId],
  )) as { dateId: string } | undefined;

  await db.execAsync("BEGIN");
  try {
    if (exists && value.date) {
      await db.runAsync(
        "UPDATE training_day_log SET date_id = ?, update_time = (strftime('%s','now') * 1000) WHERE id = ?",
        [trainingDayLogId],
      );
      await saveExerciseLogsWithSets(value.exercisesForLog ?? []);
    } else {
      await db.runAsync(
        "INSERT INTO training_day_log (date_id, date, create_time, update_time) VALUES (?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
        [trainingDayLogId, trainingDayLogId],
      );
      await saveExerciseLogsWithSets(value.exercisesForLog ?? []);
    }
    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
};
