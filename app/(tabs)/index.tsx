import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function Index() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(currentMonth.getMonth() + 1);

  const yearOptions = useMemo(() => {
    const year = currentMonth.getFullYear();
    return Array.from({ length: 11 }, (_, index) => year - 5 + index);
  }, [currentMonth]);
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index + 1),
    []
  );

  const toMonthString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };
  const toDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handlePress = () => {
          router.push({
              pathname: "/(tabs)/ExerciseProgramPage",
          })
  }

  const handlePrevMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() - 1);
    setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setPickerMonth(currentMonth.getMonth() + 1);
    setPickerOpen(true);
  };

  const applyPicker = () => {
    setCurrentMonth(new Date(pickerYear, pickerMonth - 1, 1));
    setPickerOpen(false);
  };

  const handleDatePress = (dateString: string) => {
    setSelectedDate(dateString);
    console.log("date pressed", dateString);
  };

  return (
    <View style={styles.mainContainer}>
    <Stack.Screen options={{ title: "首頁"}}/>
      <Pressable onPress={() => handlePress()}>
        <View style={styles.card}>
          <Text style={styles.title}>訓練課表</Text>
        </View>
      </Pressable>

      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <Pressable onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>{"<"}</Text>
          </Pressable>
          <Pressable onPress={openPicker} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>{toMonthString(currentMonth)}</Text>
          </Pressable>
          <Pressable onPress={handleNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>{">"}</Text>
          </Pressable>
        </View>
        <Calendar
          current={toDateString(currentMonth)}
          onDayPress={(day) => handleDatePress(day.dateString)}
          onMonthChange={(month) =>
            setCurrentMonth(new Date(month.year, month.month - 1, 1))
          }
          markedDates={
            selectedDate
              ? {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: "#111827",
                    selectedTextColor: "#FFFFFF",
                  },
                }
              : undefined
          }
          enableSwipeMonths
        />
      </View>

      <Modal
        transparent
        visible={isPickerOpen}
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select month and year</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                {yearOptions.map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => setPickerYear(year)}
                    style={[
                      styles.pickerItem,
                      pickerYear === year && styles.pickerItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        pickerYear === year && styles.pickerItemTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.pickerColumn}>
                {monthOptions.map((month) => (
                  <Pressable
                    key={month}
                    onPress={() => setPickerMonth(month)}
                    style={[
                      styles.pickerItem,
                      pickerMonth === month && styles.pickerItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        pickerMonth === month && styles.pickerItemTextActive,
                      ]}
                    >
                      {String(month).padStart(2, "0")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.pickerActions}>
              <Pressable
                onPress={() => setPickerOpen(false)}
                style={styles.pickerActionButton}
              >
                <Text style={styles.pickerActionText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={applyPicker} style={styles.pickerActionButton}>
                <Text style={styles.pickerActionText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  calendarSection: {
    marginTop: 16,
    gap: 12,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  pickerRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickerColumn: {
    flex: 1,
    gap: 8,
  },
  pickerItem: {
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  pickerItemActive: {
    backgroundColor: "#111827",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#111827",
  },
  pickerItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  pickerActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  pickerActionText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
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


