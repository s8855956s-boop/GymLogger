import * as SQLite from "expo-sqlite";
import type { ExerciseValue } from "./types";

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
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT NOT NULL,
      name TEXT NOT NULL,
      unit TEXT,
      image_uri TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sets (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT NOT NULL,
      reps TEXT,
      weight TEXT,
      position INTEGER NOT NULL
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

export const getExercisesByProgramId = (programId: string): ExerciseValue[] => {
  const rows = db.getAllSync(
    "SELECT id, name, unit, image_uri FROM exercises WHERE program_id = ? ORDER BY created_at DESC",
    [programId]
  ) as Array<{
    id: string;
    name: string;
    unit: string | null;
    image_uri: string | null;
  }>;

  return rows.map((row) => {
    const setRows = db.getAllSync(
      "SELECT id, reps, weight FROM sets WHERE exercise_id = ? ORDER BY position ASC",
      [row.id]
    ) as Array<{ id: string; reps: string | null; weight: string | null }>;

    return {
      id: row.id,
      name: row.name,
      unit: row.unit ?? null,
      imageUri: row.image_uri ?? null,
      setRows: setRows.map((setRow) => ({
        id: setRow.id,
        reps: setRow.reps ?? "",
        weight: setRow.weight ?? "",
      })),
    };
  });
};

export const saveExercise = (programId: string, value: ExerciseValue): string => {
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
