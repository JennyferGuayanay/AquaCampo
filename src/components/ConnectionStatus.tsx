import { StyleSheet, Text, View } from "react-native";

import { AquaColores } from "../constants/aquaTheme";

interface ConnectionStatusProps {
  conectado: boolean;
  pendientes: number;
  conflictos?: number;
  sincronizando?: boolean;
}

export function ConnectionStatus({
  conectado,
  pendientes,
  conflictos = 0,
  sincronizando = false,
}: ConnectionStatusProps) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.estado}>
        <View
          style={[
            estilos.punto,
            { backgroundColor: conectado ? AquaColores.exito : AquaColores.peligro },
          ]}
        />
        <Text style={estilos.texto}>
          {sincronizando
            ? "Sincronizando"
            : conectado
              ? "Con conexión"
              : "Sin conexión"}
        </Text>
      </View>
      <Text style={estilos.contador}>Pendientes {pendientes}</Text>
      {conflictos > 0 && (
        <Text style={estilos.conflicto}>Revisión {conflictos}</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    paddingVertical: 9,
  },
  estado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  punto: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  texto: {
    color: AquaColores.blanco,
    fontWeight: "700",
    fontSize: 12,
  },
  contador: {
    color: AquaColores.marino,
    backgroundColor: AquaColores.celeste,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "800",
  },
  conflicto: {
    color: "#764B00",
    backgroundColor: AquaColores.aviso,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "800",
  },
});
