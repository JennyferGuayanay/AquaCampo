import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  FadeInUp,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { AquaDropLogo } from "./AquaDropLogo";

export function VerificationCelebration() {
  const reducirMovimiento = useReducedMotion();
  const expansion = useSharedValue(reducirMovimiento ? 1 : 0);

  useEffect(() => {
    if (reducirMovimiento) return;
    expansion.set(
      withDelay(
        280,
        withTiming(1, { duration: 900, reduceMotion: ReduceMotion.System }),
      ),
    );
  }, [expansion, reducirMovimiento]);

  const anillo = useAnimatedStyle(() => ({
    opacity: 1 - expansion.get(),
    transform: [{ scale: 0.65 + expansion.get() * 1.15 }],
  }));

  return (
    <View className="relative h-40 w-48 items-center justify-center">
      <Animated.View
        style={anillo}
        className="absolute h-28 w-28 rounded-full border-4 border-cyan-300"
      />
      <Animated.View entering={FadeInUp.delay(250).duration(500)} className="absolute left-1 top-5 h-4 w-4 rounded-full bg-sky-400" />
      <Animated.View entering={FadeInUp.delay(380).duration(500)} className="absolute right-2 top-10 h-6 w-6 rounded-full bg-cyan-300" />
      <Animated.View entering={FadeInUp.delay(500).duration(500)} className="absolute bottom-5 left-7 h-3 w-3 rounded-full bg-teal-500" />
      <Animated.View entering={FadeInUp.delay(620).duration(500)} className="absolute bottom-3 right-8 h-4 w-4 rounded-full bg-sky-300" />
      <AquaDropLogo confirmacion flotante={false} />
    </View>
  );
}
