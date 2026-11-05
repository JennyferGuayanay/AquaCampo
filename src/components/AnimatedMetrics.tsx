import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  FadeInUp,
  ReduceMotion,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

interface AnimatedStatCardProps {
  etiqueta: string;
  valor: number;
  demora: number;
}

export function AnimatedStatCard({ etiqueta, valor, demora }: AnimatedStatCardProps) {
  const reducirMovimiento = useReducedMotion();
  const progreso = useSharedValue(reducirMovimiento ? valor : 0);
  const [visible, setVisible] = useState(reducirMovimiento ? valor : 0);

  useEffect(() => {
    progreso.set(
      reducirMovimiento
        ? valor
        : withTiming(valor, { duration: 900, reduceMotion: ReduceMotion.System }),
    );
  }, [progreso, reducirMovimiento, valor]);

  useAnimatedReaction(
    () => Math.round(progreso.get()),
    (actual, anterior) => {
      if (actual !== anterior) scheduleOnRN(setVisible, actual);
    },
  );

  return (
    <Animated.View
      entering={FadeInUp.delay(demora).springify().damping(14)}
      className="min-w-0 flex-1 items-center rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm"
    >
      <Text className="text-3xl font-black tracking-tight text-aqua-marino">{visible}</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={1}
        className="text-xs font-bold text-slate-500"
      >
        {etiqueta}
      </Text>
    </Animated.View>
  );
}

export function AnimatedProgressBar({ porcentaje }: { porcentaje: number }) {
  const reducirMovimiento = useReducedMotion();
  const progreso = useSharedValue(reducirMovimiento ? porcentaje : 0);

  useEffect(() => {
    progreso.set(
      reducirMovimiento
        ? porcentaje
        : withTiming(porcentaje, { duration: 1100, reduceMotion: ReduceMotion.System }),
    );
  }, [porcentaje, progreso, reducirMovimiento]);

  const estilo = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progreso.get()))}%` as `${number}%`,
  }));

  return (
    <View className="mt-5 h-2.5 overflow-hidden rounded-full bg-aqua-celeste">
    <Animated.View style={estilo} className="h-full rounded-full bg-aqua-turquesa" />
    </View>
  );
}
