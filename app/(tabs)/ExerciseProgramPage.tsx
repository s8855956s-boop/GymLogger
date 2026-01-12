import { router, Stack } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ExerciseProgram, { ExerciseProgramValue } from "../components/ExerciseProgram";

const exercisePrograms : ExerciseProgramValue[] = [
  {
    id: "1",
    name: "腿部訓練",
  },
  {
    id: "2",
    name: "胸肌訓練"
  }
];

export default function ExerciseProgramPage() {
    const handleAdd = () => {
        router.push({
            pathname: "/ExerciseProgramDetail",
        });
    }

  return(
  <View style={styles.container}>
  <Stack.Screen options={{ title: "訓練課表"}}/>
    <TouchableOpacity style={styles.addButton} onPress={() => handleAdd()}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
    <View style={styles.rows}>
      {exercisePrograms.map((row, index) => (
        <ExerciseProgram key={index} value={row}/>
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
    
