import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import ExerciseCard from "../components/ExerciseCard";
import { ExerciseValue } from "./DetailExerciseCard";

type ExerciseProgramDetailProps = {
    exercises: ExerciseValue[];
}

export default function ExerciseProgramDetail({
    exercises,
}: ExerciseProgramDetailProps) {
    const router = useRouter();

    const handlePress = (exercise: ExerciseValue) => {
        router.push({
            pathname: "/DetailExerciseCard",
            params: { value: JSON.stringify(exercise) },
        });
    };

    return (
    <View>
        {exercises.map((row, index) => (
            <Pressable key={index} onPress={() => handlePress(row)}>
                <ExerciseCard value={ row } parentStyle={styles.exerciseCard}/>
            </Pressable>
        ))}
    </View>);
}

const styles = StyleSheet.create({
    exerciseCard: {
        margin: 10,
    }
});
