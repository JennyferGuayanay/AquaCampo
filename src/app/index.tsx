import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AquaColores } from "../constants/aquaTheme";
import { useAqua } from "../context/AquaContext";

export default function Inicio() {
  const { sesion, cargando } = useAqua();

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={AquaColores.turquesaOscuro} />
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
    backgroundColor: AquaColores.fondo,
  },
});
