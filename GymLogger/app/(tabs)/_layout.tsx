import { Stack } from "expo-router";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const db = SQLite.openDatabaseSync("gymlogger.db");

export default function RootLayout() {
  useDrizzleStudio(db);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.safeArea}
        edges={["left", "right", "bottom"]}
      >
        <Stack>
          <Stack.Screen name="index" options={{ title: "?????" }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
