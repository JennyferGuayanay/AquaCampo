import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { AquaButton } from "../components/AquaButton";
import { ConnectionStatus } from "../components/ConnectionStatus";
import {
  AquaColores,
  AquaEspaciado,
  AquaRadios,
  AquaSombra,
  AquaTipografia,
} from "../constants/aquaTheme";
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

      {lecturas.length > 0 && (
        <View style={estilos.listaEncabezado}>
          <View>
            <Text style={estilos.listaSobreTitulo}>REGISTROS DE CAMPO</Text>
            <Text style={estilos.listaTitulo}>Lecturas registradas</Text>
          </View>
          <View style={estilos.totalInsignia}>
            <Text style={estilos.totalTexto}>{lecturas.length}</Text>
          </View>
        </View>
      )}

      {lecturas.map((lectura) => (
        <View key={lectura.idLocal} style={estilos.tarjeta}>
          <View style={[estilos.barraEstado, estilos[`barra_${lectura.estadoSync}`]]} />
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
            <View style={estilos.datoCaja}>
              <Text style={estilos.datoEtiqueta}>Estado</Text>
              <Text style={[estilos.datoValor, estilos.estadoMedidor]}>{lectura.estadoMedidor}</Text>
            </View>
            <View style={estilos.datoCaja}>
              <Text style={estilos.datoEtiqueta}>Lectura</Text>
              <Text style={estilos.datoValor}>{lectura.lecturaActual ?? "No disponible"}</Text>
            </View>
            <View style={estilos.datoCaja}>
              <Text style={estilos.datoEtiqueta}>Consumo</Text>
              <Text style={estilos.datoValor}>{lectura.consumo === null ? "Pendiente" : `${lectura.consumo} m³`}</Text>
            </View>
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
  contenido: { padding: 18, paddingBottom: 42, gap: AquaEspaciado.medio },
  estadoCaja: { backgroundColor: AquaColores.marino, borderRadius: AquaRadios.grande, padding: AquaEspaciado.grande, gap: 2 },
  tituloClaro: { color: AquaColores.blanco, fontSize: 21, fontWeight: "900" },
  notaClaro: { color: AquaColores.celeste, fontSize: 13, lineHeight: 19, marginTop: 8 },
  listaEncabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 2, marginTop: 2 },
  listaSobreTitulo: { color: AquaColores.turquesaOscuro, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  listaTitulo: { color: AquaColores.marino, fontSize: AquaTipografia.subtitulo, fontWeight: "900", marginTop: 2 },
  totalInsignia: { minWidth: 34, height: 34, borderRadius: 17, backgroundColor: AquaColores.celeste, alignItems: "center", justifyContent: "center" },
  totalTexto: { color: AquaColores.marino, fontWeight: "900" },
  tarjeta: { backgroundColor: AquaColores.blanco, borderRadius: AquaRadios.grande, borderWidth: 1, borderColor: AquaColores.linea, padding: 18, gap: 14, overflow: "hidden", ...AquaSombra },
  barraEstado: { height: 5, marginTop: -18, marginHorizontal: -18 },
  barra_pendiente: { backgroundColor: AquaColores.azul },
  barra_enviando: { backgroundColor: AquaColores.info },
  barra_incierto: { backgroundColor: "#D99018" },
  barra_conflicto: { backgroundColor: AquaColores.peligro },
  barra_enviado: { backgroundColor: AquaColores.exito },
  filaTitulo: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  codigo: { color: AquaColores.marino, fontSize: 20, fontWeight: "900", flexShrink: 1 },
  mes: { color: AquaColores.textoSuave, fontSize: 12 },
  insignia: { maxWidth: 145, borderRadius: AquaRadios.pequeno, paddingHorizontal: 10, paddingVertical: 7, flexShrink: 1 },
  insigniaTexto: { color: AquaColores.marino, fontSize: 11, fontWeight: "900", textAlign: "center" },
  estado_pendiente: { backgroundColor: AquaColores.celeste },
  estado_enviando: { backgroundColor: AquaColores.infoSuave },
  estado_incierto: { backgroundColor: AquaColores.aviso },
  estado_conflicto: { backgroundColor: AquaColores.peligroSuave },
  estado_enviado: { backgroundColor: AquaColores.exitoSuave },
  datos: { flexDirection: "row", gap: 8 },
  datoCaja: { flex: 1, minWidth: 0, backgroundColor: AquaColores.superficie, borderRadius: AquaRadios.pequeno, paddingHorizontal: 8, paddingVertical: 10, gap: 4 },
  datoEtiqueta: { color: AquaColores.textoSuave, fontSize: 10, fontWeight: "700" },
  datoValor: { color: AquaColores.marino, fontSize: 13, fontWeight: "900", flexShrink: 1 },
  estadoMedidor: { textTransform: "capitalize" },
  conflicto: { backgroundColor: AquaColores.aviso, padding: 13, borderRadius: 14, gap: 4 },
  conflictoTitulo: { color: AquaColores.avisoTexto, fontWeight: "900" },
  conflictoTexto: { color: AquaColores.avisoTexto, lineHeight: 19 },
  incierto: { color: AquaColores.textoSuave, fontStyle: "italic", lineHeight: 19 },
  foto: { width: "100%", height: 170, borderRadius: 15, resizeMode: "cover" },
  vacio: { backgroundColor: AquaColores.blanco, borderRadius: 22, padding: 24, alignItems: "center", gap: 8 },
  titulo: { color: AquaColores.marino, fontSize: 21, fontWeight: "900" },
  descripcion: { color: AquaColores.textoSuave, textAlign: "center" },
  cargando: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: AquaColores.fondo },
});
