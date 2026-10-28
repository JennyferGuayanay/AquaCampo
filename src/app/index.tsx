import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AquaIllustration } from "../components/AquaIllustration";
import { AquaColores } from "../constants/aquaTheme";
import { useAqua } from "../context/AquaContext";

export default function Inicio() {
  const { sesion, cargando } = useAqua();

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <View style={estilos.marcaCaja}>
          <Text style={estilos.marca}>AquaCampo</Text>
          <Text style={estilos.subtitulo}>Preparando tu jornada de campo</Text>
        </View>
        <AquaIllustration compacta />
        <ActivityIndicator size="large" color={AquaColores.turquesaOscuro} />
        <View style={estilos.lineaCarga}>
          <View style={estilos.lineaCargaActiva} />
        </View>
      </View>
    );
  }

  return <Redirect href={sesion ? "/medidores" : "/login"} />;
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AquaColores.blanco,
    paddingHorizontal: 24,
  },
  marcaCaja: {
    alignItems: "center",
    marginBottom: -8,
  },
  marca: {
    color: AquaColores.marino,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtitulo: {
    marginTop: 4,
    color: AquaColores.textoSuave,
    fontWeight: "600",
  },
  lineaCarga: {
    width: 104,
    height: 4,
    borderRadius: 2,
    marginTop: 14,
    backgroundColor: AquaColores.celesteSuave,
    overflow: "hidden",
  },
  lineaCargaActiva: {
    width: 56,
    height: "100%",
    borderRadius: 2,
    backgroundColor: AquaColores.turquesa,
  },
});
