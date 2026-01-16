import * as SQLite from "expo-sqlite";
import type { ProgramExercise, TrainingDayLog } from "./types";

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
      create_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_exercise (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT,
      name TEXT NOT NULL,
      unit TEXT,
      image_uri TEXT,
      create_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_set (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT,
      reps INTEGER,
      weight INTEGER,
      create_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS set_log (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT,
      reps INTEGER,
      weight INTEGER,
      create_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exercise_log (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT,
      training_log_id TEXT,
      name TEXT NOT NULL,
      unit TEXT,
      imageUri TEXT;
      create_time INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS training_day_log (
      id TEXT PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      create_time INTEGER NOT NULL
    );
  `);
};

export const listPrograms = (): ProgramRow[] =>
  db.getAllSync("SELECT id, name FROM programs ORDER BY created_at DESC") as ProgramRow[];

export const createProgram = (name: string): ProgramRow => {
  const id = createId("program");
  db.runSync("INSERT INTO programs (id, name, created_at) VALUES (?, ?, ?)", [
    id,
    name,
    Date.now(),
  ]);
  return { id, name };
};

export const getProgramExercisesByProgramId = (programId: string): ProgramExercise[] => {
  const exercises = db.getAllSync(
    "SELECT id, programId, name, unit, image_uri FROM exercises WHERE program_id = ? ORDER BY created_at DESC",
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
      "UPDATE exercises SET name = ?, unit = ?, image_uri = ? WHERE id = ?",
      [value.name, value.unit, value.imageUri ?? null, exerciseId]
    );
  } else {
    db.runSync(
      "INSERT INTO exercises (id, program_id, name, unit, image_uri, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [
        exerciseId,
        programId,
        value.name,
        value.unit,
        value.imageUri ?? null,
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

export const saveTraningDayLog = (value: TrainingDayLog) => {
  // const trainingDayLogId = value.id;
  // const exists = db.getFirstSync("SELECT id FROM training_day_log WHERE id = ?", [
  //   trainingDayLogId,
  // ]) as { id: string } | undefined;

  // if(exists) {
  //       db.runSync(
  //     "UPDATE exercises SET name = ?, unit = ?, image_uri = ? WHERE id = ?",
  //     [value.name, value.unit, value.imageUri ?? null, exerciseId]
  //   );
  // } else {
  //   db.runSync(
  //     "INSERT INTO exercises (id, program_id, name, unit, image_uri, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  //     [
  //       exerciseId,
  //       programId,
  //       value.name,
  //       value.unit,
  //       value.imageUri ?? null,
  //       Date.now(),
  //     ]
  // }
}
