import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { AquaButton } from "../components/AquaButton";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { AquaColores, AquaSombra } from "../constants/aquaTheme";
import { useAqua } from "../context/AquaContext";
import type { EstadoSync, Lectura } from "../types/models";

const etiquetas: Record<EstadoSync, string> = {
  pendiente: "Pendiente de envío",
  enviando: "Preparando envío",
  incierto: "Envío por confirmar",
  conflicto: "Requiere revisión",
  enviado: "Enviado y bloqueado",
};

function permiteEdicion(lectura: Lectura) {
  if (lectura.estadoSync === "pendiente") return true;
  return (
    lectura.estadoSync === "conflicto" &&
    lectura.conflicto?.tipo !== "duplicado_remoto"
  );
}

export default function Pendientes() {
  const {
    sesion,
    cargando,
    conectado,
    lecturas,
    sincronizando,
    actualizar,
    sincronizar,
  } = useAqua();
  const pendientes = lecturas.filter((item) => item.estadoSync !== "enviado").length;
  const conflictos = lecturas.filter((item) => item.estadoSync === "conflicto").length;

  useFocusEffect(
    useCallback(() => {
      void actualizar();
    }, [actualizar]),
  );

  if (cargando) {
    return <View style={estilos.cargando}><ActivityIndicator size="large" color={AquaColores.turquesaOscuro} /></View>;
  }
  if (!sesion) return <Redirect href="/login" />;

  async function ejecutarSync() {
    if (!conectado) {
      Alert.alert("Sin conexión", "Las lecturas permanecen guardadas en el dispositivo.");
      return;
    }
    const resultado = await sincronizar();
    if (!resultado) return;
    Alert.alert(
      "Sincronización terminada",
      `Confirmadas: ${resultado.enviados}\n` +
        `Revisión: ${resultado.verificacion}\n` +
        `Conflictos: ${resultado.conflictos}\n` +
        `Envíos inciertos: ${resultado.inciertos}\n` +
        `Errores: ${resultado.errores}`,
    );
  }

  return (
    <ScrollView style={estilos.pagina} contentContainerStyle={estilos.contenido}>
      <View style={estilos.estadoCaja}>
        <Text style={estilos.tituloClaro}>Estado de la jornada</Text>
        <ConnectionStatus
          conectado={conectado}
          pendientes={pendientes}
          conflictos={conflictos}
          sincronizando={sincronizando}
        />
        <Text style={estilos.notaClaro}>
          Los envíos inciertos se verifican en MockAPI por su identificador local antes de volver a intentarse.
        </Text>
      </View>

      {lecturas.length === 0 && (
        <View style={estilos.vacio}>
          <Text style={estilos.titulo}>Aún no hay lecturas</Text>
          <Text style={estilos.descripcion}>Registra un medidor desde el panel principal.</Text>
        </View>
      )}

      {lecturas.map((lectura) => (
        <View key={lectura.idLocal} style={estilos.tarjeta}>
          <View style={estilos.filaTitulo}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.codigo}>{lectura.codigoMedidor}</Text>
              <Text style={estilos.mes}>{lectura.mes}</Text>
            </View>
            <View style={[estilos.insignia, estilos[`estado_${lectura.estadoSync}`]]}>
              <Text style={estilos.insigniaTexto}>{etiquetas[lectura.estadoSync]}</Text>
            </View>
          </View>
          <View style={estilos.datos}>
            <Text style={estilos.dato}>Estado: {lectura.estadoMedidor}</Text>
            <Text style={estilos.dato}>Lectura: {lectura.lecturaActual ?? "No disponible"}</Text>
            <Text style={estilos.dato}>Consumo: {lectura.consumo === null ? "Pendiente" : `${lectura.consumo} m³`}</Text>
          </View>
          {lectura.conflicto && (
            <View style={estilos.conflicto}>
              <Text style={estilos.conflictoTitulo}>Acción necesaria</Text>
              <Text style={estilos.conflictoTexto}>{lectura.conflicto.detalle}</Text>
            </View>
          )}
          {lectura.estadoSync === "incierto" && (
            <Text style={estilos.incierto}>
              El POST pudo haber llegado al servidor. No se repetirá hasta consultar los registros remotos.
            </Text>
          )}
          {lectura.fotoUri && <Image source={{ uri: lectura.fotoUri }} style={estilos.foto} />}
          {permiteEdicion(lectura) && (
            <AquaButton
              titulo={lectura.estadoSync === "conflicto" ? "Revisar y corregir" : "Editar lectura pendiente"}
              onPress={() =>
                router.push({
                  pathname: "/registro",
                  params: { codigo: lectura.codigoMedidor, idLocal: lectura.idLocal },
                })
              }
              secundario
            />
          )}
        </View>
      ))}

      <AquaButton titulo="Actualizar y sincronizar" onPress={ejecutarSync} cargando={sincronizando} />
      <AquaButton titulo="Volver al panel" onPress={() => router.dismissTo("/medidores")} secundario />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: AquaColores.fondo },
  contenido: { padding: 18, paddingBottom: 42, gap: 15 },
  estadoCaja: { backgroundColor: AquaColores.marino, borderRadius: 22, padding: 18 },
  tituloClaro: { color: AquaColores.blanco, fontSize: 21, fontWeight: "900" },
  notaClaro: { color: AquaColores.celeste, fontSize: 12, lineHeight: 18 },
  tarjeta: { backgroundColor: AquaColores.blanco, borderRadius: 22, padding: 18, gap: 12, ...AquaSombra },
  filaTitulo: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  codigo: { color: AquaColores.marino, fontSize: 20, fontWeight: "900", flexShrink: 1 },
  mes: { color: AquaColores.textoSuave, fontSize: 12 },
  insignia: { maxWidth: 135, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, flexShrink: 1 },
  insigniaTexto: { color: AquaColores.marino, fontSize: 10, fontWeight: "900", textAlign: "center" },
  estado_pendiente: { backgroundColor: AquaColores.celeste },
  estado_enviando: { backgroundColor: "#DDE8FF" },
  estado_incierto: { backgroundColor: AquaColores.aviso },
  estado_conflicto: { backgroundColor: "#FFDADF" },
  estado_enviado: { backgroundColor: "#D6F4E9" },
  datos: { gap: 4 },
  dato: { color: AquaColores.texto },
  conflicto: { backgroundColor: AquaColores.aviso, padding: 13, borderRadius: 14, gap: 4 },
  conflictoTitulo: { color: "#764B00", fontWeight: "900" },
  conflictoTexto: { color: "#764B00", lineHeight: 19 },
  incierto: { color: AquaColores.textoSuave, fontStyle: "italic", lineHeight: 19 },
  foto: { width: "100%", height: 170, borderRadius: 15, resizeMode: "cover" },
  vacio: { backgroundColor: AquaColores.blanco, borderRadius: 22, padding: 24, alignItems: "center", gap: 8 },
  titulo: { color: AquaColores.marino, fontSize: 21, fontWeight: "900" },
  descripcion: { color: AquaColores.textoSuave, textAlign: "center" },
  cargando: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: AquaColores.fondo },
});
