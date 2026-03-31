import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

type SyncFeedbackTone = "success" | "error" | "empty";

type SyncFeedbackState = {
  color: string;
  message: string;
};

const feedbackByTone: Record<SyncFeedbackTone, SyncFeedbackState> = {
  success: {
    color: "#22C55E",
    message: "Synced",
  },
  error: {
    color: "#EF4444",
    message: "Syncing Failed",
  },
  empty: {
    color: "#000000",
    message: "No Unsynced Data",
  },
};

export default function useSyncFeedback() {
  const [feedback, setFeedback] = useState<SyncFeedbackState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      animationRef.current?.stop();
    };
  }, []);

  const showSyncFeedback = useCallback(
    (tone: SyncFeedbackTone) => {
      animationRef.current?.stop();
      setFeedback(feedbackByTone[tone]);
      opacity.setValue(1);

      const animation = Animated.sequence([
        Animated.delay(1200),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]);

      animationRef.current = animation;
      animation.start(({ finished }) => {
        if (finished) {
          setFeedback(null);
        }
      });
    },
    [opacity],
  );

  return {
    feedback,
    opacity,
    showSyncFeedback,
  };
}
