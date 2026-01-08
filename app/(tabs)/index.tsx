import { StyleSheet, View } from "react-native";
import { ExerciseValue } from "./DetailExerciseCard";
import ExerciseProgramDetail from "./ExerciseProgramDetail";

const exercises : ExerciseValue[] = [
  {
    name: "深蹲",
    unit: "公斤",
    imageUri: null,
    setRows: [{id: "set-1", reps: "8", weight: "60"},
      {id: "set-2", reps: "7", weight: "60"},
    {id: "set-3", reps: "8", weight: "50"}],
  },
  {
    name: "Zercher Squat",
    unit: "公斤",
    imageUri: null,
    setRows: [{id: "set-1", reps: "8", weight: "60"}],
  },
  {
    name: "Leg Press",
    unit: "磅",
    imageUri: null,
    setRows: [{id: "set-1", reps: "8", weight: "60"}],
  }
];

export default function Index() {

  return (
    <View>
      <ExerciseProgramDetail exercises={exercises}/>
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
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32, // 底部留空，避免被 home indicator 吃掉
  },
  cardWrapper: {
    flexDirection: "column",
    gap: 16,
    marginTop: 16,
  },
});
