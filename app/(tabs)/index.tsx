import { StyleSheet, View } from "react-native";
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

export default function Index() {

  return (
    <View style={styles.rows}>
      {exercisePrograms.map((row, index) => (
        <ExerciseProgram key={index} value={row}/>
      ))}
    </View>

    // <SafeAreaView style={styles.container}>
    //   <ScrollView contentContainerStyle={styles.scrollContent}>
    //     <View style={styles.cardWrapper}>
    //       <ExerciseCard
    //         value={exerciseValue}
    //       />
    //       <DetailExerciseCard
    //         value={exerciseValue}
    //         onChange={handleExerciseChange}
    //         onPickImage={() => console.log("pick image")}
    //       />
    //     </View>
    //   </ScrollView>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rows: {
    marginTop: 10,
    gap: 10,
  },
});
