import * as SQLite from "expo-sqlite";
import type { ExerciseLog, ProgramExercise, SetLog, TrainingDayLog } from "./types";

const db = SQLite.openDatabaseSync("gymlogger.db");

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export type ProgramRow = {
  id: string;
  name: string;
};

export const initDb = () => {
  db.execSync(`
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
      exercise_id TEXT,
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
      imageUri TEXT;
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

export const listPrograms = (): ProgramRow[] =>
  db.getAllSync("SELECT id, name FROM programs ORDER BY create_time DESC") as ProgramRow[];

export const createProgram = (name: string): ProgramRow => {
  const id = createId("program");
  db.runSync("INSERT INTO programs (id, name, create_time, update_time) VALUES (?, ?, ?)", [
    id,
    name,
    Date.now(),
    Date.now(),
  ]);
  return { id, name };
};

export const getProgramExercisesByProgramId = (programId: string): ProgramExercise[] => {
  const exercises = db.getAllSync(
    "SELECT id, programId, name, unit, image_uri FROM exercises WHERE program_id = ? ORDER BY create_time DESC",
    [programId]
  ) as {
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
      : (db.getAllSync(
          `SELECT id, exercise_id AS exerciseId, reps, weight
           FROM sets
           WHERE exercise_id IN (${exerciseIds.map(() => "?").join(", ")})
           ORDER BY position ASC`,
          exerciseIds
        ) as {
          id: string;
          exerciseId?: string;
          reps?: number;
          weight?: number;
        }[]);

  return exercises.map((exercise) => {
    const filteredRows = setRows.filter((row) => row.exerciseId === exercise.id);

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

export const saveExercise = (programId: string, value: ProgramExercise): string => {
  const exerciseId = value.id ?? createId("exercise");
  const existing = db.getFirstSync("SELECT id FROM exercises WHERE id = ?", [
    exerciseId,
  ]) as { id: string } | undefined;

  if (existing) {
    db.runSync(
      "UPDATE exercises SET name = ?, unit = ?, image_uri = ?, update_time WHERE id = ?",
      [value.name, value.unit, value.imageUri ?? null, Date.now(), exerciseId]
    );
  } else {
    db.runSync(
      "INSERT INTO exercises (id, program_id, name, unit, image_uri, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        exerciseId,
        programId,
        value.name,
        value.unit,
        value.imageUri ?? null,
        Date.now(),
        Date.now(),
      ]
    );
  }

  db.runSync("DELETE FROM sets WHERE exercise_id = ?", [exerciseId]);
  value.setRows.forEach((row, index) => {
    const setId = row.id || createId("set");
    db.runSync(
      "INSERT INTO sets (id, exercise_id, reps, weight, position) VALUES (?, ?, ?, ?, ?)",
      [setId, exerciseId, row.reps ?? "", row.weight ?? "", index]
    );
  });

  return exerciseId;
};

export const deleteExercise = (exerciseId: string) => {
  db.runSync("DELETE FROM sets WHERE exercise_id = ?", [exerciseId]);
  db.runSync("DELETE FROM exercises WHERE id = ?", [exerciseId]);
};

export const saveExerciseLogs = (values: ExerciseLog[]) => {
  values.forEach((value) => {
    db.runSync(
      `INSERT INTO exercise_log (id, exercise_id, training_log_id, name, unit, image_uri)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        exercise_id = excluded.exercise_id,
        training_log_id = excluded.training_log_id,
        name = excluded.name,
        unit = excluded.unit,
        image_uri = excluded.image_uri`,
      [
        value.id,
        value.exerciseId ?? null,
        value.trainingLogId ?? null,
        value.name,
        value.unit,
        value.imageUri ?? null,
      ]
    );
  });
};

export const saveSetLogs = (values: SetLog[]) => {
  values.forEach((value) => {
    db.runSync(
      `INSERT INTO set_log (id, exercise_log_id, reps, weight)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        id = excluded.id,
        exercise_log_id = excluded.exercise_log_id,
        reps = excluded.reps,
        weight = excluded.weight`,
      [
        value.id,
        value.exerciseLogId ?? null,
        value.reps ?? null,
        value.weight ?? null,
      ]
    );
  });
};

export const saveExerciseLogsWithSets = (
  exerciseLogs: ExerciseLog[]
) => {
  saveExerciseLogs(exerciseLogs);
  exerciseLogs.map((exerciseLog) => {
    {
      saveSetLogs(exerciseLog.sets);
    }
  })
};

export const saveTraningDayLog = (value: TrainingDayLog) => {
  const trainingDayLogId = value.id;
  const exists = db.getFirstSync("SELECT id FROM training_day_log WHERE id = ?", [
    trainingDayLogId,
  ]) as { id: string } | undefined;

  db.execSync("BEGIN");
  try {
    if(exists) {
          db.runSync(
        "UPDATE training_day_log SET date = ? update_time = ? WHERE id = ?",
        [value.date.getDate(), Date.now()]
      );
      saveExerciseLogsWithSets(value.exerciseLogs);
    } else {
      db.runSync(
        "INSERT INTO training_day_log (id, date, create_time, update_time) VALUES (?, ?, ?, ?)",
        [
          value.id,
          value.date.getDate(),
          Date.now(),
          Date.now()
        ]);
      saveExerciseLogsWithSets(value.exerciseLogs);
    }
    db.execSync("COMMIT");
  } catch (error) {
    db.execSync("ROLLBACK");
    throw error;
  }
}
