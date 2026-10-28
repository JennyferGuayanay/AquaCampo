import { StyleSheet, View } from "react-native";

import { AquaColores, AquaSombra } from "../constants/aquaTheme";

interface AquaIllustrationProps {
  compacta?: boolean;
}

export function AquaIllustration({ compacta = false }: AquaIllustrationProps) {
  return (
    <View
      accessible
      accessibilityLabel="Vivienda conectada a una red de agua y a un medidor"
      style={[estilos.escena, compacta && estilos.escenaCompacta]}
    >
      <View style={estilos.sol} />
      <View style={estilos.nubeUno} />
      <View style={estilos.nubeDos} />

      <View style={estilos.casa}>
        <View style={estilos.techo} />
        <View style={estilos.chimenea} />
        <View style={estilos.ventana}>
          <View style={estilos.cruzVertical} />
          <View style={estilos.cruzHorizontal} />
        </View>
        <View style={estilos.puerta}>
          <View style={estilos.manija} />
        </View>
      </View>

      <View style={estilos.tuberiaHorizontal} />
      <View style={estilos.tuberiaVertical} />
      <View style={estilos.unionTuberia} />

      <View style={estilos.medidor}>
        <View style={estilos.esfera}>
          <View style={estilos.marcaUno} />
          <View style={estilos.marcaDos} />
          <View style={estilos.aguja} />
          <View style={estilos.centro} />
        </View>
        <View style={estilos.baseMedidor} />
      </View>

      <View style={estilos.suelo} />
      <View style={estilos.ondaUno} />
      <View style={estilos.ondaDos} />
    </View>
  );
}

const estilos = StyleSheet.create({
  escena: {
    width: "100%",
    maxWidth: 330,
    height: 190,
    alignSelf: "center",
  },
  escenaCompacta: {
    height: 165,
    transform: [{ scale: 0.88 }],
    marginVertical: -10,
  },
  sol: {
    position: "absolute",
    right: 22,
    top: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AquaColores.celeste,
  },
  nubeUno: {
    position: "absolute",
    left: 18,
    top: 24,
    width: 46,
    height: 15,
    borderRadius: 10,
    backgroundColor: AquaColores.blanco,
    borderWidth: 1,
    borderColor: AquaColores.linea,
  },
  nubeDos: {
    position: "absolute",
    left: 47,
    top: 15,
    width: 34,
    height: 22,
    borderRadius: 13,
    backgroundColor: AquaColores.blanco,
    borderWidth: 1,
    borderColor: AquaColores.linea,
  },
  casa: {
    position: "absolute",
    left: 38,
    bottom: 40,
    width: 132,
    height: 91,
    borderRadius: 7,
    backgroundColor: AquaColores.blanco,
    borderWidth: 2,
    borderColor: AquaColores.marino,
    ...AquaSombra,
  },
  techo: {
    position: "absolute",
    top: -37,
    left: 16,
    width: 98,
    height: 74,
    borderRadius: 8,
    backgroundColor: AquaColores.azul,
    borderWidth: 2,
    borderColor: AquaColores.marino,
    transform: [{ rotate: "45deg" }],
  },
  chimenea: {
    position: "absolute",
    right: 20,
    top: -42,
    width: 15,
    height: 31,
    backgroundColor: AquaColores.marino,
    borderRadius: 3,
  },
  ventana: {
    position: "absolute",
    left: 17,
    bottom: 21,
    width: 36,
    height: 36,
    backgroundColor: AquaColores.celesteSuave,
    borderWidth: 2,
    borderColor: AquaColores.turquesaOscuro,
  },
  cruzVertical: {
    position: "absolute",
    left: 15,
    width: 2,
    height: "100%",
    backgroundColor: AquaColores.turquesaOscuro,
  },
  cruzHorizontal: {
    position: "absolute",
    top: 15,
    width: "100%",
    height: 2,
    backgroundColor: AquaColores.turquesaOscuro,
  },
  puerta: {
    position: "absolute",
    right: 18,
    bottom: 0,
    width: 38,
    height: 58,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: AquaColores.marino,
  },
  manija: {
    position: "absolute",
    right: 7,
    top: 31,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: AquaColores.celeste,
  },
  tuberiaHorizontal: {
    position: "absolute",
    left: 161,
    bottom: 55,
    width: 80,
    height: 12,
    backgroundColor: AquaColores.turquesa,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: AquaColores.marino,
  },
  tuberiaVertical: {
    position: "absolute",
    right: 78,
    bottom: 55,
    width: 12,
    height: 35,
    backgroundColor: AquaColores.turquesa,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: AquaColores.marino,
  },
  unionTuberia: {
    position: "absolute",
    right: 72,
    bottom: 52,
    width: 24,
    height: 18,
    borderRadius: 7,
    backgroundColor: AquaColores.turquesaOscuro,
  },
  medidor: {
    position: "absolute",
    right: 34,
    bottom: 62,
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 7,
    borderColor: AquaColores.marino,
    backgroundColor: AquaColores.blanco,
    alignItems: "center",
    justifyContent: "center",
    ...AquaSombra,
  },
  esfera: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: AquaColores.azul,
    alignItems: "center",
    justifyContent: "center",
  },
  marcaUno: {
    position: "absolute",
    top: 6,
    width: 3,
    height: 9,
    borderRadius: 2,
    backgroundColor: AquaColores.turquesaOscuro,
  },
  marcaDos: {
    position: "absolute",
    right: 8,
    width: 9,
    height: 3,
    borderRadius: 2,
    backgroundColor: AquaColores.turquesaOscuro,
  },
  aguja: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: AquaColores.peligro,
    transform: [{ rotate: "-35deg" }, { translateX: 10 }],
  },
  centro: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: AquaColores.marino,
  },
  baseMedidor: {
    position: "absolute",
    bottom: -17,
    width: 51,
    height: 14,
    borderRadius: 5,
    backgroundColor: AquaColores.marino,
  },
  suelo: {
    position: "absolute",
    left: 24,
    right: 20,
    bottom: 35,
    height: 3,
    borderRadius: 2,
    backgroundColor: AquaColores.marino,
  },
  ondaUno: {
    position: "absolute",
    left: 45,
    right: 45,
    bottom: 20,
    height: 10,
    borderTopWidth: 3,
    borderColor: AquaColores.azul,
    borderRadius: 50,
  },
  ondaDos: {
    position: "absolute",
    left: 83,
    right: 16,
    bottom: 7,
    height: 10,
    borderTopWidth: 3,
    borderColor: AquaColores.celeste,
    borderRadius: 50,
  },
});
