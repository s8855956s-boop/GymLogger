import * as SQLite from "expo-sqlite";
import {
  createLogExerise,
  createProgramExercise,
  LogSet,
  ProgramExercise,
  type Log,
  type LogExercise,
  type Program,
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
      program_exercise_id TEXT,
      reps INTEGER,
      weight INTEGER,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS log_set (
      id TEXT PRIMARY KEY NOT NULL,
      log_exercise_id TEXT,
      reps INTEGER,
      weight INTEGER,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS log_exercise (
      id TEXT PRIMARY KEY NOT NULL,
      log_id TEXT,
      name TEXT NOT NULL,
      unit TEXT,
      image_uri TEXT,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS log (
      date_id INTEGER PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      create_time INTEGER NOT NULL,
      update_time INTEGER NOT NULL,
      synchronized INTEGER NOT NULL DEFAULT 0
    );
  `);
};

export const fecthUnsyncedLogs = async (): Promise<Log[]> => {
  const db = await getDb();
  const unsyncedLogs = (await db.getAllAsync(
    "SELECT date_id As dateId FROM log WHERE synchronized = 0",
  )) as { dateId: number }[];
  const logs: Log[] = [];
  for (const log of unsyncedLogs) {
    const fullLog = await getLogByDate(log.dateId);
    logs.push(fullLog);
  }
  return logs;
};

export const markLogsAsSynced = async (dateIds: number[]) => {
  const db = await getDb();
  if (dateIds.length === 0) return;
  const placeholders = dateIds.map(() => "?").join(", ");
  await db.runAsync(
    `UPDATE log SET synchronized = 1 WHERE date_id IN (${placeholders})`,
    dateIds,
  );
};

export const listPrograms = async (): Promise<Program[]> => {
  const db = await getDb();
  return (await db.getAllAsync(
    "SELECT id, name FROM program ORDER BY create_time DESC;",
  )) as Program[];
};

export const createProgram = async (name: string): Promise<Program> => {
  const db = await getDb();
  const id = createId("program");
  await db.runAsync(
    "INSERT INTO program (id, name, create_time, update_time) VALUES (?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
    [id, name],
  );
  return { id, name };
};

export const logExists = async (id: number) => {
  const db = await getDb();

  const row = await db.getFirstAsync(
    "SELECT 1 FROM log WHERE date_id = ? LIMIT 1",
    [id],
  );
  return !!row;
};

export const getLogByDate = async (date: number): Promise<Log> => {
  const db = await getDb();

  type ExerciseSets = {
    id: string;
    logExerciseId: string;
    logId: number;
    name: string;
    unit: string;
    imageUri: string;
    reps: string;
    weight: string;
    exerciseCreateDate: number;
    exerciseUpdateDate: number;
    setCreateDate: number;
    setUpdateDate: number;
    logCreateDate: number;
    logUpdateDate: number;
  };
  const queryResults = (await db.getAllAsync(
    `
  SELECT
    tdl.create_time AS logCreateDate, tdl.update_time AS logUpdateDate,
    ls.id, le.id AS logExerciseId, le.log_id AS logId, le.name, le.unit, le.image_uri AS imageUri, le.create_time AS exerciseCreateDate, le.update_time AS exerciseUpdateDate,
    ls.reps, ls.weight, ls.create_time AS setCreateDate, ls.update_time AS setUpdateDate
  FROM
    log tdl
  LEFT JOIN log_exercise le ON tdl.date_id = le.log_id
  LEFT JOIN log_set ls ON le.id = ls.log_exercise_id
  WHERE tdl.date_id = ?
  `,
    [date],
  )) as ExerciseSets[];
  if (queryResults.length < 1) return {};

  const distinctLogId = queryResults[0].logId;

  let filteredResults = queryResults.filter(
    (result) => result.logId === distinctLogId,
  );
  const groupedByExerciseId = new Map<string, ExerciseSets[]>();

  for (const exerciseSet of filteredResults) {
    if (!groupedByExerciseId.has(exerciseSet.logExerciseId))
      groupedByExerciseId.set(exerciseSet.logExerciseId, []);
    groupedByExerciseId.get(exerciseSet.logExerciseId)!.push(exerciseSet);
  }

  let logExercises: LogExercise[] = [];
  for (const key of groupedByExerciseId.keys()) {
    const exerciseSets = groupedByExerciseId.get(key);
    if (exerciseSets === undefined) continue;
    const setRows = exerciseSets
      ?.filter((set) => set.id)
      .map((set) => {
        return {
          id: set.id,
          logExerciseId: set.logExerciseId,
          reps: set.reps == null ? undefined : Number(set.reps),
          weight: set.weight == null ? undefined : Number(set.weight),
          createDate: set.setCreateDate
            ? new Date(set.setCreateDate)
            : undefined,
          updateDate: set.setUpdateDate
            ? new Date(set.setUpdateDate)
            : undefined,
        };
      });

    logExercises.push(
      createLogExerise(
        exerciseSets[0].logExerciseId,
        exerciseSets[0].logId,
        exerciseSets[0].name,
        exerciseSets[0].unit,
        exerciseSets[0].imageUri,
        setRows,
        exerciseSets[0].exerciseCreateDate
          ? new Date(exerciseSets[0].exerciseCreateDate)
          : undefined,
        exerciseSets[0].exerciseUpdateDate
          ? new Date(exerciseSets[0].exerciseUpdateDate)
          : undefined,
      ),
    );
  }

  return {
    dateId: distinctLogId,
    date: new Date(date),
    logExercises: logExercises,
    createDate: queryResults[0].logCreateDate
      ? new Date(queryResults[0].logCreateDate)
      : undefined,
    updateDate: queryResults[0].logUpdateDate
      ? new Date(queryResults[0].logUpdateDate)
      : undefined,
  };
};

export const getExercisesForProgramByProgramId = async (
  programId: string,
): Promise<ProgramExercise[]> => {
  const db = await getDb();
  const exercises = (await db.getAllAsync(
    "SELECT id, program_id AS programId, name, unit, image_uri AS imageUri FROM program_exercise WHERE program_id = ? ORDER BY create_time DESC",
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
          `SELECT id, program_exercise_id AS programExerciseId, reps, weight
           FROM program_set
           WHERE program_exercise_id IN (${exerciseIds.map(() => "?").join(", ")})
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

    return createProgramExercise(
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
  value: ProgramExercise,
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

  await db.runAsync("DELETE FROM log_set WHERE log_exercise_id = ?", [
    programExerciseId,
  ]);
  await Promise.all(
    value.sets.map(async (row, index) => {
      const setId = row.id || createId("set");
      await db.runAsync(
        "INSERT INTO log_set (id, log_exercise_id, reps, weight, position, create_time, update_time) VALUES (?, ?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
        [setId, programExerciseId, row.reps ?? "", row.weight ?? "", index],
      );
    }),
  );

  return programExerciseId;
};

export const deleteLogExercise = async (exerciseId: string) => {
  const db = await getDb();
  await db.runAsync("DELETE FROM log_set WHERE log_exercise_id = ?", [
    exerciseId,
  ]);
  await db.runAsync("DELETE FROM log_exercise WHERE id = ?", [exerciseId]);
};

export const saveLogExercises = async (values: LogExercise[]) => {
  const db = await getDb();
  await db.runAsync(
    "UPDATE log SET update_time = (strftime('%s','now') * 1000), synchronized = 0 WHERE date_id = ?",
    [values[0].logId ?? null],
  );
  await Promise.all(
    values.map(async (value) => {
      await db.runAsync(
        `INSERT INTO log_exercise (id, log_id, name, unit, image_uri, create_time, update_time)
      VALUES (?, ?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))
      ON CONFLICT(id) DO UPDATE SET
        log_id = excluded.log_id,
        name = excluded.name,
        unit = excluded.unit,
        image_uri = excluded.image_uri,
        update_time = (strftime('%s','now') * 1000)`,
        [
          value.id ?? null,
          value.logId ?? null,
          value.name,
          value.unit,
          value.imageUri ?? null,
        ],
      );
    }),
  );

  await Promise.all(
    values.map((exerciseLog) => saveLogSets(exerciseLog.sets, exerciseLog.id)),
  );
};

export const saveLogSets = async (values: LogSet[], logExerciseId?: string) => {
  const db = await getDb();
  await Promise.all(
    values.map(async (value) => {
      await db.runAsync(
        `INSERT INTO log_set (id, log_exercise_id, reps, weight, create_time, update_time)
      VALUES (?, ?, ?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))
      ON CONFLICT(id) DO UPDATE SET
        id = excluded.id,
        log_exercise_id = excluded.log_exercise_id,
        reps = excluded.reps,
        weight = excluded.weight,
        update_time = (strftime('%s','now') * 1000)`,
        [
          value.id ?? null,
          logExerciseId ?? null,
          value.reps ?? null,
          value.weight ?? null,
        ],
      );
    }),
  );

  const ids = values.flatMap((value) => (value.id ? [value.id] : []));

  if (logExerciseId) {
    if (ids.length === 0) {
      await db.runAsync("DELETE FROM log_set WHERE log_exercise_id = ?", [
        logExerciseId,
      ]);
    } else {
      const placeholders = ids.map(() => "?").join(", ");
      await db.runAsync(
        `DELETE FROM log_set WHERE log_exercise_id = ? AND id NOT IN (${placeholders})`,
        [logExerciseId, ...ids],
      );
    }
  }
};

export const saveExerciseLogsWithSets = async (LogExercises: LogExercise[]) => {
  await saveLogExercises(LogExercises);
};

export const saveLog = async (value: Log) => {
  const db = await getDb();
  const logId = value.dateId ?? null;
  const exists = (await db.getFirstAsync(
    "SELECT date_id FROM log WHERE date_id = ?",
    [logId],
  )) as { dateId: string } | undefined;

  await db.execAsync("BEGIN");
  try {
    if (exists && value.dateId) {
      await db.runAsync(
        "UPDATE log SET date_id = ?, update_time = (strftime('%s','now') * 1000) WHERE date_id = ?",
        [logId],
      );
      await saveExerciseLogsWithSets(value.logExercises ?? []);
    } else {
      await db.runAsync(
        "INSERT INTO log (date_id, date, create_time, update_time) VALUES (?, ?, (strftime('%s','now') * 1000), (strftime('%s','now') * 1000))",
        [logId, logId],
      );
      await saveExerciseLogsWithSets(value.logExercises ?? []);
    }
    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
};
