import { StyleSheet, Text, View } from "react-native";

import {
  AquaColores,
  AquaEspaciado,
  AquaRadios,
  AquaSombra,
  AquaTipografia,
} from "../constants/aquaTheme";
import type { Medidor } from "../types/models";

interface MeterCardProps {
  medidor: Medidor;
}

export function MeterCard({ medidor }: MeterCardProps) {
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
        <View style={estilos.estadoInsignia}>
          <Text style={estilos.estadoTexto}>{medidor.estado}</Text>
        </View>
      </View>

      <View style={estilos.ubicacion}>
        <Text style={estilos.tituloDato}>UBICACIÓN DEL SERVICIO</Text>
        <Text style={estilos.direccion}>{medidor.direccion}</Text>
        <Text style={estilos.detalleSuave}>Sector {medidor.sector}</Text>
      </View>

      <View style={estilos.metricas}>
        <View style={estilos.metrica}>
          <Text style={estilos.metricaEtiqueta}>Lectura anterior</Text>
          <Text style={estilos.metricaValor}>{medidor.ultimaLectura} m³</Text>
        </View>
        <View style={estilos.separador} />
        <View style={estilos.metrica}>
          <Text style={estilos.metricaEtiqueta}>Promedio mensual</Text>
          <Text style={estilos.metricaValor}>{medidor.promedioMensual} m³</Text>
        </View>
      </View>

      <View style={estilos.fila}>
        <Text style={estilos.filaEtiqueta}>Cuenta</Text>
        <Text style={estilos.valor}>{medidor.numeroCuenta}</Text>
      </View>
      <View style={estilos.fila}>
        <Text style={estilos.filaEtiqueta}>Última fecha</Text>
        <Text style={estilos.valor}>{medidor.fechaUltimaLectura}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: AquaColores.blanco,
    borderRadius: AquaRadios.grande,
    borderWidth: 1,
    borderColor: AquaColores.linea,
    padding: AquaEspaciado.grande,
    gap: AquaEspaciado.medio,
    ...AquaSombra,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: AquaEspaciado.pequeno,
    borderBottomWidth: 1,
    borderColor: AquaColores.linea,
    paddingBottom: AquaEspaciado.medio,
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
  estadoInsignia: {
    maxWidth: 92,
    backgroundColor: AquaColores.celesteSuave,
    borderRadius: AquaRadios.pequeno,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  estadoTexto: {
    color: AquaColores.turquesaOscuro,
    fontSize: AquaTipografia.etiqueta,
    fontWeight: "900",
    textTransform: "capitalize",
    textAlign: "center",
  },
  ubicacion: {
    backgroundColor: AquaColores.superficie,
    borderRadius: AquaRadios.medio,
    padding: 14,
    gap: 4,
  },
  direccion: {
    color: AquaColores.marino,
    fontSize: AquaTipografia.cuerpo,
    fontWeight: "800",
    lineHeight: 21,
  },
  detalleSuave: { color: AquaColores.textoSuave, fontSize: 13 },
  metricas: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: AquaColores.marino,
    borderRadius: AquaRadios.medio,
    paddingVertical: 14,
  },
  metrica: { flex: 1, alignItems: "center", paddingHorizontal: 8, gap: 4 },
  metricaEtiqueta: { color: AquaColores.celeste, fontSize: 11, fontWeight: "700", textAlign: "center" },
  metricaValor: { color: AquaColores.blanco, fontSize: AquaTipografia.subtitulo, fontWeight: "900", textAlign: "center" },
  separador: { width: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: AquaEspaciado.medio,
    alignItems: "flex-start",
  },
  tituloDato: {
    color: AquaColores.turquesaOscuro,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  filaEtiqueta: { color: AquaColores.textoSuave, fontSize: 13 },
  valor: {
    color: AquaColores.texto,
    fontWeight: "700",
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
    lineHeight: 19,
  },
});
