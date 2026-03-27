import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Program } from "../types";

type ExerciseProgramProps = {
  value: Program;
};

export default function ExerciseProgram({ value }: ExerciseProgramProps) {
  const handlePress = (id?: string, name?: string) => {
    router.push({
      pathname: "/(tabs)/ExerciseProgramDetail",
      params: { id: id, name: name },
    });
  };

  return (
    <View style={styles.mainContainer}>
      <Pressable onPress={() => handlePress(value.id, value.name)}>
        <View style={styles.card}>
          <Text style={styles.title}>{value.name || "New Program"}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});
