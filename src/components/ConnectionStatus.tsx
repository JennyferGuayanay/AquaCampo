import { StyleSheet, Text, View } from "react-native";

import { AquaColores, AquaRadios } from "../constants/aquaTheme";

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
      <View
        accessibilityLabel={sincronizando ? "Sincronizando" : conectado ? "Con conexión" : "Sin conexión"}
        style={[
          estilos.estado,
          sincronizando
            ? estilos.estadoSincronizando
            : conectado
              ? estilos.estadoConectado
              : estilos.estadoDesconectado,
        ]}
      >
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
    gap: 8,
    paddingTop: 10,
  },
  estado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: AquaRadios.pequeno,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  estadoConectado: { backgroundColor: "rgba(33, 135, 103, 0.22)" },
  estadoDesconectado: { backgroundColor: "rgba(181, 58, 72, 0.26)" },
  estadoSincronizando: { backgroundColor: "rgba(70, 185, 220, 0.24)" },
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
    borderRadius: AquaRadios.pequeno,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "800",
  },
  conflicto: {
    color: AquaColores.avisoTexto,
    backgroundColor: AquaColores.aviso,
    borderRadius: AquaRadios.pequeno,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "800",
  },
});
