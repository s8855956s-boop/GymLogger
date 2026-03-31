import { Animated, StyleSheet, Text } from "react-native";

type SyncStatusToastProps = {
  message: string | null;
  color: string;
  opacity: Animated.Value;
};

export default function SyncStatusToast({
  message,
  color,
  opacity,
}: SyncStatusToastProps) {
  if (!message) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(134, 134, 137, 0.92)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
  },
});
