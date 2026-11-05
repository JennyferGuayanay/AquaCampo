import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";

import { AquaButton } from "./AquaButton";
import { AquaColores, AquaSombra } from "../constants/aquaTheme";

interface SyncSuccessAnimationProps {
  onDismiss(): void;
}

export function SyncSuccessAnimation({ onDismiss }: SyncSuccessAnimationProps) {
  const [animationFailed, setAnimationFailed] = useState(false);

  return (
    <Modal
      animationType="fade"
      transparent
      visible
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {animationFailed ? (
            <View
              accessible
              accessibilityLabel="Sincronización confirmada"
              style={styles.fallback}
            >
              <Text style={styles.fallbackCheck}>✓</Text>
            </View>
          ) : (
            <LottieView
              source={require("../../assets/animations/sync-success.json")}
              autoPlay
              loop={false}
              resizeMode="contain"
              onAnimationFailure={() => setAnimationFailed(true)}
              style={styles.animation}
              webStyle={styles.webAnimation}
            />
          )}
          <Text
            accessibilityRole="header"
            style={styles.title}
          >
            Lecturas sincronizadas correctamente
          </Text>
          <Text style={styles.description}>
            Tus lecturas pendientes ya están actualizadas.
          </Text>
          <AquaButton titulo="Continuar" onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(11, 32, 53, 0.72)",
  },
  card: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AquaColores.borde,
    backgroundColor: AquaColores.blanco,
    ...AquaSombra,
  },
  animation: {
    width: 156,
    height: 156,
  },
  webAnimation: {
    width: 156,
    height: 156,
    alignSelf: "center",
  },
  fallback: {
    width: 156,
    height: 156,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#B9DED0",
    backgroundColor: "#E6F4EF",
  },
  fallbackCheck: {
    color: AquaColores.exito,
    fontSize: 64,
    fontWeight: "900",
  },
  title: {
    color: AquaColores.marino,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    marginBottom: 8,
    color: AquaColores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
