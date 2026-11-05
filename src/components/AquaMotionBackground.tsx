import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface AquaMotionBackgroundProps {
  oscuro?: boolean;
}

export function AquaMotionBackground({ oscuro = false }: AquaMotionBackgroundProps) {
  const reducirMovimiento = useReducedMotion();
  const recorrido = useSharedValue(0);

  useEffect(() => {
    if (reducirMovimiento) return;
    recorrido.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 5200 }),
          withTiming(0, { duration: 5200 }),
        ),
        -1,
      ),
    );
  }, [recorrido, reducirMovimiento]);

  const ondaUno = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(recorrido.get(), [0, 1], [-24, 24]) },
      { translateY: interpolate(recorrido.get(), [0, 1], [0, 10]) },
      { rotate: "-7deg" },
    ],
  }));

  const ondaDos = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(recorrido.get(), [0, 1], [20, -20]) },
      { translateY: interpolate(recorrido.get(), [0, 1], [8, -4]) },
      { rotate: "8deg" },
    ],
  }));

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <View
        className={`absolute -right-24 -top-20 h-72 w-72 rounded-full ${
          oscuro ? "bg-teal-400/10" : "bg-cyan-200/45"
        }`}
      />
      <Animated.View
        style={ondaUno}
        className={`absolute -left-24 top-[18%] h-28 w-[150%] rounded-[50%] ${
          oscuro ? "bg-cyan-300/10" : "bg-white/60"
        }`}
      />
      <Animated.View
        style={ondaDos}
        className={`absolute -right-32 bottom-[8%] h-36 w-[155%] rounded-[50%] ${
          oscuro ? "bg-teal-500/10" : "bg-cyan-200/35"
        }`}
      />
      <View
        className={`absolute bottom-[28%] left-8 h-5 w-5 rounded-full ${
          oscuro ? "bg-cyan-200/15" : "bg-teal-500/10"
        }`}
      />
      <View
        className={`absolute right-12 top-[35%] h-9 w-9 rounded-full ${
          oscuro ? "bg-cyan-200/10" : "bg-sky-400/10"
        }`}
      />
    </View>
  );
}
