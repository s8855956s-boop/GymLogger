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
  sets: string;
  reps: string;
  weight: string;
  unit: string;
};

type ExerciseCardProps = {
  value: ExerciseValue;
  onChange: (nextValue: ExerciseValue) => void;
  onPickImage: () => void;
  unitOptions: string[];
};

export default function ExerciseCard({
  value,
  onChange,
  onPickImage,
  unitOptions,
}: ExerciseCardProps) {
  const [isUnitModalVisible, setUnitModalVisible] = useState(false);

  const selectedUnitLabel = useMemo(() => {
    if (value.unit) {
      return value.unit;
    }

    return unitOptions[0] ?? "選擇單位";
  }, [unitOptions, value.unit]);

  const updateField = <Key extends keyof ExerciseValue>(
    key: Key,
    fieldValue: ExerciseValue[Key]
  ) => {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>訓練內容</Text>
      <TextInput
        value={value.name}
        onChangeText={(text) => updateField("name", text)}
        placeholder="運動名稱"
        style={styles.input}
      />

      <View style={styles.imageRow}>
        <Image
          source={value.imageUri ? { uri: value.imageUri } : placeholderImage}
          style={styles.image}
        />
        <TouchableOpacity onPress={onPickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>選擇照片</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>組數</Text>
          <TextInput
            value={value.sets}
            onChangeText={(text) => updateField("sets", text)}
            placeholder="0"
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>次數</Text>
          <TextInput
            value={value.reps}
            onChangeText={(text) => updateField("reps", text)}
            placeholder="0"
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>重量</Text>
          <TextInput
            value={value.weight}
            onChangeText={(text) => updateField("weight", text)}
            placeholder="0"
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>單位</Text>
          <Pressable
            onPress={() => setUnitModalVisible(true)}
            style={styles.dropdown}
          >
            <Text style={styles.dropdownText}>{selectedUnitLabel}</Text>
          </Pressable>
        </View>
      </View>

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
                  updateField("unit", option);
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
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
