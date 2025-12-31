import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import ExerciseCard, { ExerciseValue } from "./components/ExerciseCard";

const UNIT_OPTIONS = ["公斤", "磅"];

export default function Index() {
  const [name, setName] = useState("深蹲");
  const [setRows, setSetRows] = useState([
    { id: "set-1", reps: "8", weight: "60" },
  ]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);

  // TODO: replace with an array of cards when supporting multiple exercises.
  const exerciseValue: ExerciseValue = {
    name,
    imageUri,
    setRows,
  };

  const handleExerciseChange = (nextValue: ExerciseValue) => {
    setName(nextValue.name);
    setSetRows(nextValue.setRows);
    setImageUri(nextValue.imageUri ?? null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardWrapper}>
        <ExerciseCard
          value={exerciseValue}
          onChange={handleExerciseChange}
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
