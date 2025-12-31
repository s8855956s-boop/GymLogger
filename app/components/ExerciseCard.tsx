import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const placeholderImage = require("../../assets/images/react-logo.png");

export type ExerciseValue = {
  name: string;
  imageUri?: string | null;
  setRows: SetRow[];
};

type SetRow = {
  id: string;
  reps: string;
  weight: string;
};

type ExerciseCardProps = {
  value: ExerciseValue;
  onChange: (nextValue: ExerciseValue) => void;
  onPickImage: () => void;
  unitOptions: string[];
  unit: string;
  onUnitChange: (nextUnit: string) => void;
};

export default function ExerciseCard({
  value,
  onChange,
  onPickImage,
  unitOptions,
  unit,
  onUnitChange,
}: ExerciseCardProps) {
  const [isUnitModalVisible, setUnitModalVisible] = useState(false);

  const selectedUnitLabel = useMemo(() => {
    if (unit) {
      return unit;
    }

    return unitOptions[0] ?? "選擇單位";
  }, [unit, unitOptions]);

  const updateField = <Key extends keyof ExerciseValue>(
    key: Key,
    fieldValue: ExerciseValue[Key]
  ) => {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  };

  const handleAddSet = () => {
    const newSet: SetRow = {
      id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reps: "",
      weight: "",
    };

    updateField("setRows", [...value.setRows, newSet]);
  };

  const updateSetRow = (id: string, field: "reps" | "weight", next: string) => {
    const nextRows = value.setRows.map((row) =>
      row.id === id ? { ...row, [field]: next } : row
    );

    updateField("setRows", nextRows);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>訓練內容</Text>
        <Pressable
          onPress={() => setUnitModalVisible(true)}
          style={styles.unitBadge}
        >
          <Text style={styles.unitBadgeText}>{selectedUnitLabel}</Text>
        </Pressable>
      </View>
      <TextInput
        value={value.name}
        onChangeText={(text) => updateField("name", text)}
        placeholder="運動名稱"
        style={styles.input}
      />

      <View style={styles.imageRow}>
        {value.imageUri ? (
          <Image source={{ uri: value.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Image source={placeholderImage} style={styles.placeholderImage} />
            <Text style={styles.placeholderText}>尚未新增照片</Text>
          </View>
        )}
        <TouchableOpacity onPress={onPickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>新增照片</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.setHeader}>
        <Text style={styles.sectionTitle}>每組紀錄</Text>
        <TouchableOpacity onPress={handleAddSet} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 新增一列</Text>
        </TouchableOpacity>
      </View>

      {value.setRows.map((row, index) => (
        <View key={row.id} style={styles.setRow}>
          <View style={styles.setIndex}>
            <Text style={styles.setIndexText}>{index + 1}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>次數</Text>
            <TextInput
              value={row.reps}
              onChangeText={(text) => updateSetRow(row.id, "reps", text)}
              placeholder="0"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>重量</Text>
            <TextInput
              value={row.weight}
              onChangeText={(text) => updateSetRow(row.id, "weight", text)}
              placeholder="0"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>
      ))}

      <Modal
        visible={isUnitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnitModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setUnitModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇單位</Text>
            {unitOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  onUnitChange(option);
                  setUnitModalVisible(false);
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E0E7FF",
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4338CA",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  placeholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 6,
  },
  placeholderImage: {
    width: 32,
    height: 32,
    opacity: 0.8,
  },
  placeholderText: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
  imageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  imageButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  field: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  setIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  setIndexText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 14,
    color: "#1F2937",
  },
});
