import { StyleSheet, Text, View } from "react-native";

import { AquaColores, AquaSombra } from "../constants/aquaTheme";
import type { Medidor } from "../types/models";

interface MeterCardProps {
  medidor: Medidor;
}

export function MeterCard({ medidor }: MeterCardProps) {
  const datos = [
    ["Dirección", medidor.direccion],
    ["Sector", medidor.sector],
    ["Cuenta", medidor.numeroCuenta],
    ["Estado", medidor.estado],
    ["Lectura anterior", `${medidor.ultimaLectura} m³`],
    ["Última fecha", medidor.fechaUltimaLectura],
    ["Promedio mensual", `${medidor.promedioMensual} m³`],
  ];

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.encabezado}>
        <View style={estilos.icono}>
          <View style={estilos.aguja} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.etiqueta}>MEDIDOR IDENTIFICADO</Text>
          <Text style={estilos.codigo}>{medidor.codigo}</Text>
        </View>
      </View>
      {datos.map(([titulo, valor]) => (
        <View key={titulo} style={estilos.fila}>
          <Text style={estilos.tituloDato}>{titulo}</Text>
          <Text style={estilos.valor}>{valor}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: AquaColores.blanco,
    borderRadius: 24,
    padding: 20,
    gap: 10,
    ...AquaSombra,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderColor: AquaColores.borde,
    paddingBottom: 14,
  },
  icono: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 5,
    borderColor: AquaColores.turquesa,
    justifyContent: "center",
    alignItems: "center",
  },
  aguja: {
    width: 20,
    height: 3,
    backgroundColor: AquaColores.peligro,
    transform: [{ rotate: "-35deg" }, { translateX: 7 }],
  },
  etiqueta: {
    color: AquaColores.turquesaOscuro,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  codigo: {
    color: AquaColores.marino,
    fontSize: 22,
    fontWeight: "900",
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    alignItems: "flex-start",
  },
  tituloDato: {
    color: AquaColores.textoSuave,
    fontSize: 13,
    width: 108,
    flexShrink: 0,
  },
  valor: {
    color: AquaColores.texto,
    fontWeight: "700",
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
    lineHeight: 19,
  },
});
