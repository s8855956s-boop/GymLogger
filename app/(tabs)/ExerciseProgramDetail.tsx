import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ExerciseCard from "../components/ExerciseCard";
import { deleteExercise, getProgramExercisesByProgramId, initDb } from "../db";
import type { ProgramExercise } from "../types";

type ExerciseProgramDetailProps = {
  id?: string;
};

export default function ExerciseProgramDetail({
  id: idProp,
}: ExerciseProgramDetailProps) {
  const router = useRouter();
  const { id: idParam, name: programName } = useLocalSearchParams<{
    id?: string;
    name?: string;
  }>();
  const programId =
    typeof idProp === "string" && idProp.length > 0
      ? idProp
      : typeof idParam === "string"
      ? idParam
      : undefined;
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const loadExercises = useCallback(() => {
    if (!programId) {
      setExercises([]);
      return;
    }
    setExercises(getProgramExercisesByProgramId(programId));
  }, [programId]);

  useEffect(() => {
    initDb();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const handlePress = (exercise: ProgramExercise) => {
    if (!programId) {
      return;
    }
    router.push({
      pathname: "/ExerciseCardDetail",
      params: {
        value: JSON.stringify(exercise),
        name: exercise.name,
        programId,
        exerciseId: exercise.id ?? "",
      },
    });
  };

  const handleAdd = () => {
    if (!programId) {
      Alert.alert("Missing program", "Please pick a program first.");
      return;
    }
    router.push({
      pathname: "/ExerciseCardDetail",
      params: { programId },
    });
  };

  const handleDeleteExercise = (exerciseId?: string) => {
    if (!exerciseId) {
      return;
    }
    Alert.alert(
      "Confirm delete",
      "Delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteExercise(exerciseId);
            loadExercises();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAdd()}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <Stack.Screen options={{ title: programName ?? "Program" }} />
      {exercises.map((row, index) => (
        <Pressable
          key={row.id ?? `${row.name}-${index}`}
          onPress={() => handlePress(row)}
        >
          <ExerciseCard
            value={row}
            isProgram={true}
            parentStyle={styles.exerciseCard}
            handleDelete={() => handleDeleteExercise(row.id)}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 10,
    gap: 10,
    paddingHorizontal: 16,
  },
  exerciseCard: {
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
