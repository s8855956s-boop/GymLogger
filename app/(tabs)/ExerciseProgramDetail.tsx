import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ExerciseCard from "../components/ExerciseCard";
import { ExerciseValue } from "./DetailExerciseCard";

type Program = {
  id: string;
  exercises: ExerciseValue[];
};

const exercises1 : ExerciseValue[] = [
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
    setRows: [{id: "set-1", reps: "8", weight: "60"},
      {id: "set-2", reps: "8", weight: "60"},
    {id: "set-3", reps: "8", weight: "60"}],
  },
  {
    name: "Leg Press",
    unit: "磅",
    imageUri: null,
    setRows: [{id: "set-1", reps: "8", weight: "60"}],
  }
];

const exercises2 : ExerciseValue[] = [
  {
    name: "臥推",
    unit: "公斤",
    imageUri: null,
    setRows: [{id: "set-1", reps: "5", weight: "60"},
      {id: "set-2", reps: "5", weight: "60"},
    {id: "set-3", reps: "5", weight: "60"}],
  },
  {
    name: "上斜啞鈴臥推",
    unit: "公斤",
    imageUri: null,
    setRows: [{id: "set-1", reps: "8", weight: "20"},
      {id: "set-2", reps: "8", weight: "20"},
    {id: "set-3", reps: "8", weight: "20"}],
  },
  {
    name: "雙槓撐體",
    unit: "磅",
    imageUri: null,
    setRows: [{id: "set-1", reps: "8", weight: "80"}],
  }
];

const programs : Program[] = [
    {
        id: "1",
        exercises: exercises1,
    },
    {
        id: "2",
        exercises: exercises2,
    }
]

type ExerciseProgramDetailProps = {
    id: string;
}

export default function ExerciseProgramDetail({
    id: idProp,
}: ExerciseProgramDetailProps) {
    const router = useRouter();
      const { id: idParam } = useLocalSearchParams<{ id?: string }>();
      const exercises = useMemo<ExerciseValue[]>(() => {
        if (idProp) {
            const program = programs.find(v => v.id === idProp);
            if(program != null && program !== undefined){
                return program.exercises;
            } else {
                return [];
            }
        }
    
        if (typeof idParam === "string") {
          try {
            const program = programs.find(v => v.id === idParam);
            if(program != null && program !== undefined){
                return program.exercises;
            } else {
                return [];
            }
          } catch {
            return [];
          }
        }
    
        return [];
      }, [idParam, idProp]);

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
                <ExerciseCard value={ row } isProgram={true} parentStyle={styles.exerciseCard}/>
            </Pressable>
        ))}
    </View>);
}

const styles = StyleSheet.create({
    exerciseCard: {
        margin: 10,
    }
});
