import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import LottieView from "lottie-react-native";

import { AquaColores } from "../constants/aquaTheme";

type LottieVariant = "loading" | "success";

interface LottieStateAnimationProps {
  variant: LottieVariant;
  size?: number;
  onFinish?(): void;
}

const animaciones = {
  loading: require("../../assets/animations/aqua-loading.json"),
  success: require("../../assets/animations/reading-saved.json"),
};

export function LottieStateAnimation({
  variant,
  size = 136,
  onFinish,
}: LottieStateAnimationProps) {
  const [fallo, setFallo] = useState(false);
  const dimensiones = { width: size, height: size };

  if (fallo) {
    return variant === "loading" ? (
      <ActivityIndicator
        size="large"
        color={AquaColores.turquesaOscuro}
        style={dimensiones}
      />
    ) : (
      <View
        accessible
        accessibilityLabel="Lectura guardada"
        style={[estilos.fallbackExito, dimensiones]}
      >
        <Text style={estilos.check}>✓</Text>
      </View>
    );
  }

  return (
    <LottieView
      source={animaciones[variant]}
      autoPlay
      loop={variant === "loading"}
      resizeMode="contain"
      onAnimationFailure={() => {
        setFallo(true);
        if (variant === "success") onFinish?.();
      }}
      onAnimationFinish={(cancelada) => {
        if (variant === "success" && !cancelada) onFinish?.();
      }}
      style={[estilos.animacion, dimensiones]}
      webStyle={{ ...dimensiones, alignSelf: "center" }}
    />
  );
}

const estilos = StyleSheet.create({
  animacion: { alignSelf: "center" },
  fallbackExito: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#B9DED0",
    backgroundColor: "#E6F4EF",
  },
  check: { color: AquaColores.exito, fontSize: 58, fontWeight: "900" },
});
