import * as SQLite from "expo-sqlite";
import type {
  ExerciseLog,
  ExerciseProgramValue,
  ExerciseValue,
  ProgramExercise,
  SetLog,
  TrainingDayLog,
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
    CREATE TABLE IF NOT EXISTS program (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_exercise (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT,
      name TEXT NOT NULL,
      unit TEXT,
      image_uri TEXT,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_set (
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
    CREATE TABLE IF NOT EXISTS exercise_log (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT,
      training_log_id TEXT,
      name TEXT NOT NULL,
      unit TEXT,
      image_uri TEXT,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS training_day_log (
      id TEXT PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
  `);
};

export const listPrograms = async (): Promise<ExerciseProgramValue[]> => {
  const db = await getDb();
  return (await db.getAllAsync(
    "SELECT id, name FROM program ORDER BY create_time DESC;",
  )) as ExerciseProgramValue[];
};

export const createProgram = async (
  name: string,
): Promise<ExerciseProgramValue> => {
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

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  type ExerciseSets = {
    id: string;
    exerciseLogId: string;
    trainingLogId: string;
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
  LEFT JOIN exercise_log el ON tdl.id = el.training_log_id
  LEFT JOIN set_log sl ON el.id = sl.exercise_log_id
  WHERE tdl.date >= ? AND tdl.date <= ?
  `,
    [start.getTime(), end.getTime()],
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

  let exerciseLogs: ExerciseLog[] = [];
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

    exerciseLogs.push({
      id: exerciseSets[0].exerciseLogId,
      trainingLogId: exerciseSets[0].trainingLogId,
      name: exerciseSets[0].name,
      unit: exerciseSets[0].unit,
      imageUri: exerciseSets[0].imageUri,
      sets: setRows,
    });
  }

  return {
    id: distinctTrainingLogId,
    date: new Date(date),
    exerciseLogs: exerciseLogs,
  };
};

export const getProgramExercisesByProgramId = async (
  programId: string,
): Promise<ProgramExercise[]> => {
  const db = await getDb();
  const exercises = (await db.getAllAsync(
    "SELECT id, program_id AS programId, name, unit, image_uri FROM exercises WHERE program_id = ? ORDER BY create_time DESC",
    [programId],
  )) as {
    id: string;
    programId: string;
    name: string;
    unit: string | null;
    image_uri: string | null;
  }[];

  const exerciseIds = exercises.map((exercise) => exercise.id);
  const setRows =
    exerciseIds.length === 0
      ? []
      : ((await db.getAllAsync(
          `SELECT id, exercise_id AS exerciseId, reps, weight
           FROM sets
           WHERE exercise_id IN (${exerciseIds.map(() => "?").join(", ")})
           ORDER BY position ASC`,
          exerciseIds,
        )) as {
          id: string;
          exerciseId?: string;
          reps?: number;
          weight?: number;
        }[]);

  return exercises.map((exercise) => {
    const filteredRows = setRows.filter(
      (row) => row.exerciseId === exercise.id,
    );

    return {
      id: exercise.id,
      programId: exercise.programId,
      name: exercise.name,
      unit: exercise.unit ?? null,
      imageUri: exercise.image_uri ?? null,
      setRows: filteredRows.map((row) => ({
        id: row.id,
        exerciseId: row.exerciseId,
        reps: row.reps ?? undefined,
        weight: row.weight ?? undefined,
      })),
    };
  });
};

export const saveProgramExercise = async (
  id: string,
  programId: string,
  value: ExerciseValue,
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
  await db.runAsync("DELETE FROM exercise_log WHERE id = ?", [exerciseId]);
};

export const saveExerciseLogs = async (values: ExerciseLog[]) => {
  const db = await getDb();
  await Promise.all(
    values.map(async (value) => {
      await db.runAsync(
        `INSERT INTO exercise_log (id, exercise_id, training_log_id, name, unit, image_uri, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))
      ON CONFLICT(id) DO UPDATE SET
        exercise_id = excluded.exercise_id,
        training_log_id = excluded.training_log_id,
        name = excluded.name,
        unit = excluded.unit,
        image_uri = excluded.image_uri,
        update_time = (strftime('%s','now') * 1000)`,
        [
          value.id ?? null,
          value.exerciseId ?? null,
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
  values: SetLog[],
  exercise_log_id?: string,
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
          exercise_log_id ?? null,
          value.reps ?? null,
          value.weight ?? null,
        ],
      );
    }),
  );
};

export const saveExerciseLogsWithSets = async (exerciseLogs: ExerciseLog[]) => {
  await saveExerciseLogs(exerciseLogs);
  await Promise.all(
    exerciseLogs.map((exerciseLog) =>
      saveSetLogs(exerciseLog.sets, exerciseLog.id),
    ),
  );
};

export const saveTraningDayLog = async (value: TrainingDayLog) => {
  const db = await getDb();
  const trainingDayLogId = value.id ?? null;
  const exists = (await db.getFirstAsync(
    "SELECT id FROM training_day_log WHERE id = ?",
    [trainingDayLogId],
  )) as { id: string } | undefined;

  await db.execAsync("BEGIN");
  try {
    if (exists && value.date) {
      await db.runAsync(
        "UPDATE training_day_log SET date = ?, update_time = (strftime('%s','now') * 1000) WHERE id = ?",
        [value.date.getTime()],
      );
      await saveExerciseLogsWithSets(value.exerciseLogs ?? []);
    } else if (value.date) {
      await db.runAsync(
        "INSERT INTO training_day_log (id, date, create_time, update_time) VALUES (?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
        [value.id ?? null, value.date.getTime()],
      );
      await saveExerciseLogsWithSets(value.exerciseLogs ?? []);
    }
    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
};
