import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import synchronizeData from "../commonFunctions/sync";
import useSyncFeedback from "../commonFunctions/useSyncFeedback";
import ExerciseCard from "../components/ExerciseCard";
import SyncStatusToast from "../components/SyncStatusToast";
import {
  deleteLogExercise,
  getExercisesForProgramByProgramId,
  getLogByDate,
  initDb,
} from "../db";
import type { ExerciseUI } from "../types";

type ExerciseProgramDetailProps = {
  id?: string;
};

export default function ExerciseProgramDetail({
  id: idProp,
}: ExerciseProgramDetailProps) {
  const router = useRouter();
  const {
    id: idParam,
    name: programName,
    isLog: isLogString,
    selectedDate: selectedDateParam,
  } = useLocalSearchParams<{
    id?: string;
    name?: string;
    isLog?: string;
    selectedDate?: string;
  }>();
  const isLog = isLogString === "true";
  const programId =
    typeof idProp === "string" && idProp.length > 0
      ? idProp
      : typeof idParam === "string"
        ? idParam
        : undefined;

  const selectedDate = selectedDateParam;
  const [exercises, setExercises] = useState<ExerciseUI[]>([]);
  const { feedback, opacity, showSyncFeedback } = useSyncFeedback();

  const loadExercises = useCallback(async () => {
    if (isLog) {
      const log = await getLogByDate(Date.parse(selectedDate ?? ""));
      if (
        log != null &&
        log !== undefined &&
        log.logExercises != null &&
        log.logExercises !== undefined
      ) {
        setExercises(log.logExercises);
        return;
      } else {
        setExercises([]);
        return;
      }
    }
    if (!programId) {
      setExercises([]);
      return;
    }
    setExercises(await getExercisesForProgramByProgramId(programId));
  }, [isLog, selectedDate, programId]);

  useEffect(() => {
    void initDb();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadExercises();
    }, [loadExercises]),
  );

  const handlePress = (exercise: ExerciseUI) => {
    router.push({
      pathname: "/ExerciseCardDetail",
      params: {
        value: JSON.stringify(exercise),
        name: exercise.name,
        programId,
        logId: selectedDate,
        exerciseId: exercise.id ?? "",
      },
    });
  };

  const handleAdd = () => {
    if (isLog) {
      router.push({
        pathname: "/ExerciseCardDetail",
        params: { logId: selectedDate },
      });
    } else if (!programId) {
      router.push({
        pathname: "/ExerciseCardDetail",
      });
    } else {
      router.push({
        pathname: "/ExerciseCardDetail",
        params: { programId },
      });
    }
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
            void (async () => {
              await deleteLogExercise(exerciseId);
              await loadExercises();
            })();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleSynchronize = async () => {
    const result = await synchronizeData();
    showSyncFeedback(result);
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAdd()}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      {isLog ? (
        <Stack.Screen
          options={{
            title: selectedDate ?? "",
            headerRight: () => (
              <Button title="同步" onPress={() => void handleSynchronize()} />
            ),
          }}
        />
      ) : (
        <Stack.Screen
          options={{
            title: programName ?? "Program",
            headerRight: () => (
              <Button title="同步" onPress={() => void handleSynchronize()} />
            ),
          }}
        />
      )}
      {exercises.map((row, index) => (
        <Pressable
          key={`${row.name}-${index}`}
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
      <SyncStatusToast
        message={feedback?.message ?? null}
        color={feedback?.color ?? "#22C55E"}
        opacity={opacity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
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
