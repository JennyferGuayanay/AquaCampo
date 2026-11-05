import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type ViewStyle,
} from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AquaButtonProps {
  titulo: string;
  onPress: () => void;
  secundario?: boolean;
  peligro?: boolean;
  deshabilitado?: boolean;
  cargando?: boolean;
  icono?: ReactNode;
  style?: ViewStyle;
}

export function AquaButton({
  titulo,
  onPress,
  secundario = false,
  peligro = false,
  deshabilitado = false,
  cargando = false,
  icono,
  style,
}: AquaButtonProps) {
  const inactivo = deshabilitado || cargando;
  const variante = peligro
    ? "border-red-700 bg-red-700"
    : secundario
      ? "border-aqua-celeste bg-aqua-celeste"
      : "border-aqua-marino bg-aqua-marino";
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.get() }],
  }));

  function cambiarEscala(valor: number) {
    escala.set(
      withSpring(valor, {
        damping: 14,
        stiffness: 280,
        mass: 0.45,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }

  return (
    <Animated.View style={[style, estiloAnimado]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: inactivo, busy: cargando }}
        disabled={inactivo}
        onPress={onPress}
        onPressIn={() => cambiarEscala(0.94)}
        onPressOut={() => cambiarEscala(1)}
        className={`min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 ${variante} ${
          inactivo ? "opacity-55" : ""
        }`}
      >
        {cargando ? (
          <ActivityIndicator color={secundario && !peligro ? "#102C46" : "#FFFFFF"} />
        ) : (
          icono
        )}
        <Text
          className={`shrink text-center text-base font-extrabold leading-5 ${
            secundario && !peligro ? "text-aqua-marino" : "text-white"
          }`}
        >
          {titulo}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
