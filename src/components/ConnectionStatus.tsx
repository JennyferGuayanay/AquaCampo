import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useAqua } from "../context/AquaContext";

interface ConnectionStatusProps {
  soloConexion?: boolean;
}

export function ConnectionStatus({ soloConexion = false }: ConnectionStatusProps) {
  const { conectado, lecturas, sincronizando } = useAqua();
  const pendientes = lecturas.filter((item) => item.estadoSync !== "enviado").length;
  const conflictos = lecturas.filter((item) => item.estadoSync === "conflicto").length;
  const estado = sincronizando
    ? "Sincronizando"
    : conectado
      ? "Con internet"
      : "Sin internet";
  const conexion = useSharedValue(conectado ? 1 : 0);
  const escala = useSharedValue(1);

  useEffect(() => {
    conexion.set(
      withTiming(conectado ? 1 : 0, {
        duration: 450,
        reduceMotion: ReduceMotion.System,
      }),
    );
    escala.set(0.9);
    escala.set(
      withSpring(1, {
        damping: 13,
        stiffness: 190,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [conectado, conexion, escala, estado]);

  const estiloEstado = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      conexion.get(),
      [0, 1],
      ["#FFF4E5", "#E6F4EF"],
    ),
    borderColor: interpolateColor(
      conexion.get(),
      [0, 1],
      ["#F0D8B7", "#B9DED0"],
    ),
    transform: [{ scale: escala.get() }],
  }));

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Animated.View
        accessibilityLabel={estado}
        style={estiloEstado}
        className="flex-row items-center gap-2 rounded-xl border px-3 py-2"
      >
        {sincronizando ? (
          <ActivityIndicator size="small" color="#087E91" />
        ) : (
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              conectado ? "bg-emerald-700" : "bg-amber-600"
            }`}
          />
        )}
        <Text className="text-xs font-extrabold text-aqua-marino">{estado}</Text>
      </Animated.View>

      {!soloConexion && (
        <Text className="rounded-xl border border-aqua-celeste bg-aqua-celeste px-3 py-2 text-xs font-extrabold text-aqua-marino">
          Pendientes {pendientes}
        </Text>
      )}

      {!soloConexion && conflictos > 0 && (
        <Text className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-900">
          Conflictos {conflictos}
        </Text>
      )}
    </View>
  );
}
