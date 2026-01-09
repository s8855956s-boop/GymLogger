import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ExerciseValue } from "../(tabs)/DetailExerciseCard";

type ExerciseCardProps = {
  value: ExerciseValue;
  isProgram?: boolean;
  parentStyle?: StyleProp<ViewStyle>;
};

export default function ExerciseCard({ value, isProgram = false, parentStyle }: ExerciseCardProps) {
  const setsAreIdentical = () => {
    const repsOfSets: string[] = [];
    const weightsOfSets: string[] = [];
    value.setRows.map((row) => {
      repsOfSets.push(row.reps);
      weightsOfSets.push(row.weight);
    });

    const repsOfFirst = repsOfSets.find(v => v != null);
    const weightOfFirst = weightsOfSets.find(v => v != null);

    return !((repsOfFirst != null && repsOfSets.some(v => v != null && v !== repsOfFirst))
    || weightOfFirst != null && weightsOfSets.some(v => v != null && v !== weightOfFirst));
  }

  const renderProgramSummary = () => {
    if (setsAreIdentical()) {
      return (
        <View style={styles.row}>
          <Text style={styles.rowText}>共{value.setRows.length}組</Text>
          <Text style={styles.rowText}>每組{value.setRows[0].reps || "-"} 次</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.rowText}>
            {value.setRows[0].weight || "-"}
            {value.unit ? ` ${value.unit}` : ""}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.summary}>
          <Text>共{value.setRows.length}組</Text>
        </View>
      );
    }
  }

  return (
    <View style={[styles.card, parentStyle]}>
      <Text style={styles.title}>{value.name || "未命名動作"}</Text>

      <View style={styles.rows}>
        {isProgram ? renderProgramSummary() : <></>}
        {(isProgram && setsAreIdentical()) ? <></> :
        value.setRows.length ? (
          value.setRows.map((row, index) => (
            <View key={row.id || index} style={styles.row}>
              <View style={styles.setIndex}>
                <Text style={styles.index}>{index + 1}</Text>
              </View>
              <Text style={styles.rowText}>{row.reps || "-"} 次</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.rowText}>
                {row.weight || "-"}
                {value.unit ? ` ${value.unit}` : ""}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>尚未新增組數</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summary: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  setIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  index: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  rowText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  dot: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
