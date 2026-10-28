import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { AquaButton } from "../components/AquaButton";
import { MeterCard } from "../components/MeterCard";
import { AquaColores, AquaSombra } from "../constants/aquaTheme";
import { useAqua } from "../context/AquaContext";
import { useMedidor } from "../hooks/useMedidor";
import { validarCodigo } from "../utils/rules";

export default function Detalle() {
  const parametros = useLocalSearchParams<{ codigo?: string }>();
  const codigo = typeof parametros.codigo === "string" ? parametros.codigo : "";
  const { sesion, cargando: cargandoSesion, conectado } = useAqua();
  const { medidor, cargando, error, recargar } = useMedidor(codigo);

  if (cargandoSesion) {
    return <View style={estilos.centro}><ActivityIndicator size="large" color={AquaColores.turquesaOscuro} /></View>;
  }
  if (!sesion) return <Redirect href="/login" />;

  if (!validarCodigo(codigo)) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>Código no válido</Text>
        <AquaButton titulo="Volver al panel" onPress={() => router.replace("/medidores")} />
      </View>
    );
  }

  return (
    <ScrollView style={estilos.pagina} contentContainerStyle={estilos.contenido}>
      {cargando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" color={AquaColores.turquesaOscuro} />
          <Text style={estilos.descripcion}>Consultando información del medidor...</Text>
        </View>
      ) : medidor ? (
        <>
          <MeterCard medidor={medidor} />
          <AquaButton
            titulo="Registrar lectura"
            onPress={() => router.push({ pathname: "/registro", params: { codigo } })}
          />
          {conectado && (
            <AquaButton titulo="Actualizar datos" onPress={() => void recargar()} secundario />
          )}
        </>
      ) : (
        <View style={estilos.aviso}>
          <Text style={estilos.titulo}>
            {conectado ? "Medidor no encontrado" : "Registro sin datos previos"}
          </Text>
          <Text style={estilos.descripcion}>{error}</Text>
          {!conectado && (
            <>
              <Text style={estilos.descripcion}>
                Puedes guardar la lectura. Se verificará automáticamente al recuperar la conexión.
              </Text>
              <AquaButton
                titulo="Registrar para verificar después"
                onPress={() => router.push({ pathname: "/registro", params: { codigo } })}
              />
            </>
          )}
          {conectado && <AquaButton titulo="Intentar otra vez" onPress={() => void recargar()} secundario />}
        </View>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: AquaColores.fondo },
  contenido: { padding: 18, gap: 16, flexGrow: 1 },
  centro: { flex: 1, minHeight: 260, alignItems: "center", justifyContent: "center", gap: 15, padding: 20 },
  aviso: { backgroundColor: AquaColores.blanco, borderRadius: 24, padding: 22, gap: 14, ...AquaSombra },
  titulo: { color: AquaColores.marino, fontSize: 23, fontWeight: "900", textAlign: "center" },
  descripcion: { color: AquaColores.textoSuave, lineHeight: 21, textAlign: "center" },
});
