import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ExerciseProgram from "../components/ExerciseProgram";
import { createProgram, initDb, listPrograms } from "../db";
import type { ExerciseProgramValue } from "../types";

export default function ExerciseProgramPage() {
  const [programs, setPrograms] = useState<ExerciseProgramValue[]>([]);

  const loadPrograms = useCallback(() => {
    setPrograms(listPrograms());
  }, []);

  useEffect(() => {
    initDb();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPrograms();
    }, [loadPrograms])
  );

  const handleAdd = () => {
    const program = createProgram("New Program");
    router.push({
      pathname: "/ExerciseProgramDetail",
      params: { id: program.id, name: program.name },
    });
    loadPrograms();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Programs" }} />
      <TouchableOpacity style={styles.addButton} onPress={() => handleAdd()}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <View style={styles.rows}>
        {programs.map((row) => (
          <ExerciseProgram key={row.id} value={row} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 10,
    paddingHorizontal: 16,
  },
  rows: {
    gap: 10,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 22,
  },
});
