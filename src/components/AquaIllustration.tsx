import { StyleSheet, Text, View } from "react-native";

import { AquaColores } from "../constants/aquaTheme";

export function AquaIllustration() {
  return (
    <View accessible accessibilityLabel="Gota de agua junto a un medidor" style={estilos.escena}>
      <View style={estilos.gota} />
      <View style={estilos.medidor}>
        <View style={estilos.esfera}>
          <View style={estilos.aguja} />
          <View style={estilos.centro} />
        </View>
        <Text style={estilos.numero}>001250</Text>
      </View>
      <View style={estilos.onda} />
    </View>
  );
}

const estilos = StyleSheet.create({
  escena: {
    width: 250,
    height: 150,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  gota: {
    position: "absolute",
    left: 27,
    top: 23,
    width: 70,
    height: 70,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    borderBottomLeftRadius: 44,
    backgroundColor: AquaColores.turquesa,
    transform: [{ rotate: "45deg" }],
  },
  medidor: {
    width: 130,
    height: 112,
    marginLeft: 66,
    borderRadius: 30,
    borderWidth: 7,
    borderColor: AquaColores.marino,
    backgroundColor: AquaColores.blanco,
    alignItems: "center",
    paddingTop: 9,
  },
  esfera: {
    width: 65,
    height: 65,
    borderRadius: 33,
    borderWidth: 4,
    borderColor: AquaColores.turquesaOscuro,
    alignItems: "center",
    justifyContent: "center",
  },
  aguja: {
    width: 25,
    height: 3,
    backgroundColor: AquaColores.peligro,
    transform: [{ rotate: "-35deg" }, { translateX: 9 }],
  },
  centro: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AquaColores.marino,
  },
  numero: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: AquaColores.marino,
  },
  onda: {
    position: "absolute",
    bottom: 5,
    width: 210,
    height: 16,
    borderTopWidth: 4,
    borderColor: AquaColores.celeste,
    borderRadius: 50,
  },
});
