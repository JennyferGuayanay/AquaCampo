import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface AquaDropLogoProps {
  confirmacion?: boolean;
  flotante?: boolean;
}

export function AquaDropLogo({ confirmacion = false, flotante = true }: AquaDropLogoProps) {
  const reducirMovimiento = useReducedMotion();
  const escala = useSharedValue(reducirMovimiento ? 1 : 0.2);
  const altura = useSharedValue(0);

  useEffect(() => {
    if (reducirMovimiento) return;
    escala.set(
      withSpring(1, {
        damping: 10,
        stiffness: 150,
        mass: 0.8,
        reduceMotion: ReduceMotion.System,
      }),
    );
    if (flotante) {
      altura.set(
        withDelay(
          650,
          withRepeat(
            withSequence(
              withTiming(-8, { duration: 1600, reduceMotion: ReduceMotion.System }),
              withTiming(3, { duration: 1600, reduceMotion: ReduceMotion.System }),
            ),
            -1,
            true,
          ),
        ),
      );
    }
  }, [altura, escala, flotante, reducirMovimiento]);

  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateY: altura.get() }, { scale: escala.get() }],
  }));

  return (
    <Animated.View style={estilo} className="h-28 w-28 items-center justify-center">
      <View className="absolute h-24 w-24 rotate-45 rounded-tl-[50px] rounded-tr-[50px] rounded-bl-[50px] rounded-br-[18px] bg-teal-600 shadow-lg" />
      <View className="absolute left-9 top-7 h-6 w-3 -rotate-[28deg] rounded-full bg-white/50" />
      <Text className="text-5xl font-black text-white">{confirmacion ? "✓" : "A"}</Text>
    </Animated.View>
  );
}
