import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";
import Animated, {
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedTextFieldProps extends TextInputProps {
  containerClassName?: string;
}

export function AnimatedTextField({
  containerClassName = "",
  onBlur,
  onFocus,
  style,
  ...props
}: AnimatedTextFieldProps) {
  const foco = useSharedValue(0);

  const estiloAnimado = useAnimatedStyle(() => ({
    borderColor: interpolateColor(foco.get(), [0, 1], ["#CBE4E9", "#087C98"]),
    transform: [{ scale: 1 + foco.get() * 0.018 }],
  }));

  return (
    <Animated.View
      style={estiloAnimado}
      className={`overflow-hidden rounded-2xl border-2 bg-slate-50 ${containerClassName}`}
    >
      <TextInput
        {...props}
        onFocus={(evento) => {
          foco.set(
            withSpring(1, {
              damping: 18,
              stiffness: 220,
              reduceMotion: ReduceMotion.System,
            }),
          );
          onFocus?.(evento);
        }}
        onBlur={(evento) => {
          foco.set(
            withSpring(0, {
              damping: 18,
              stiffness: 220,
              reduceMotion: ReduceMotion.System,
            }),
          );
          onBlur?.(evento);
        }}
        className="min-h-14 px-4 text-base text-slate-900"
        placeholderTextColor="#94a3b8"
        style={style}
      />
    </Animated.View>
  );
}
