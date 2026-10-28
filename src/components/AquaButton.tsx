import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";

import { AquaColores } from "../constants/aquaTheme";

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
  return (
    <Pressable
      accessibilityRole="button"
      disabled={deshabilitado || cargando}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        secundario && estilos.secundario,
        peligro && estilos.peligro,
        (deshabilitado || cargando) && estilos.deshabilitado,
        pressed && estilos.presionado,
        style,
      ]}
    >
      {cargando ? <ActivityIndicator color={AquaColores.blanco} /> : icono}
      <Text style={[estilos.texto, secundario && estilos.textoSecundario]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: AquaColores.turquesaOscuro,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  secundario: {
    backgroundColor: AquaColores.celeste,
    borderWidth: 1,
    borderColor: AquaColores.turquesa,
  },
  peligro: {
    backgroundColor: AquaColores.peligro,
  },
  deshabilitado: {
    opacity: 0.5,
  },
  presionado: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  texto: {
    color: AquaColores.blanco,
    fontWeight: "800",
    fontSize: 16,
  },
  textoSecundario: {
    color: AquaColores.marino,
  },
});
