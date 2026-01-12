import { router, Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const handlePress = () => {
          router.push({
              pathname: "/(tabs)/ExerciseProgramPage",
          })
  }

  return (
    <View style={styles.mainContainer}>
    <Stack.Screen options={{ title: "首頁"}}/>
      <Pressable onPress={() => handlePress()}>
        <View style={styles.card}>
          <Text style={styles.title}>訓練課表</Text>
        </View>
      </Pressable>
    </View>

    // <SafeAreaView style={styles.container}>
    //   <ScrollView contentContainerStyle={styles.scrollContent}>
    //     <View style={styles.cardWrapper}>
    //       <ExerciseCard
    //         value={exerciseValue}
    //       />
    //       <ExerciseCardDetail
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  mainContainer: {
    marginTop: 12,
    marginHorizontal: 12,
  },
  rows: {
    marginTop: 10,
    gap: 10,
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
});
