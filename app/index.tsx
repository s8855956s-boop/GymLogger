import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import ExerciseCard, { ExerciseValue } from "./components/ExerciseCard";

const UNIT_OPTIONS = ["公斤", "磅", "次數"];

export default function Index() {
  const [exercise, setExercise] = useState<ExerciseValue>({
    name: "深蹲",
    imageUri: null,
    sets: "4",
    reps: "8",
    weight: "60",
  });
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardWrapper}>
        <ExerciseCard
          value={exercise}
          onChange={setExercise}
          onPickImage={() => console.log("pick image")}
          unitOptions={UNIT_OPTIONS}
          unit={unit}
          onUnitChange={setUnit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  cardWrapper: {
    marginTop: 16,
  },
});
