import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AquaButton } from "../components/AquaButton";
import { AquaIllustration } from "../components/AquaIllustration";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { AquaColores, AquaSombra } from "../constants/aquaTheme";
import { useAqua } from "../context/AquaContext";
import { borrarBorrador, obtenerBorrador } from "../storage/local";
import { validarCodigo } from "../utils/rules";

export default function Medidores() {
  const {
    sesion,
    cargando,
    conectado,
    lecturas,
    sincronizando,
    salir,
  } = useAqua();
  const [codigo, setCodigo] = useState("");
  const borradorRevisado = useRef(false);

  const pendientes = lecturas.filter((item) => item.estadoSync !== "enviado").length;
  const conflictos = lecturas.filter((item) => item.estadoSync === "conflicto").length;
  const enviados = lecturas.filter((item) => item.estadoSync === "enviado").length;
  const porcentajeEnviado = lecturas.length
    ? Math.round((enviados / lecturas.length) * 100)
    : 0;

  useEffect(() => {
    if (!sesion || borradorRevisado.current) return;
    borradorRevisado.current = true;
    obtenerBorrador(sesion).then((borrador) => {
      if (!borrador) return;
      Alert.alert(
        "Registro sin terminar",
        "Encontramos un borrador de tu última jornada. Puedes continuarlo o descartarlo.",
        [
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => void borrarBorrador(sesion),
          },
          {
            text: "Continuar",
            onPress: () =>
              router.push({
                pathname: "/registro",
                params: {
                  codigo: borrador.codigo,
                  idLocal: borrador.idLocal ?? undefined,
                  borrador: "1",
                },
              }),
          },
        ],
      );
    });
  }, [sesion]);

  if (!cargando && !sesion) return <Redirect href="/login" />;

  function consultar() {
    const normalizado = codigo.trim().toUpperCase();
    setCodigo(normalizado);
    if (!validarCodigo(normalizado)) {
      Alert.alert("Código incorrecto", "Usa el formato MED- seguido de seis dígitos.");
      return;
    }
    router.push({ pathname: "/detalle", params: { codigo: normalizado } });
  }

  async function cerrar() {
    await salir();
    router.replace("/login");
  }

  return (
    <ScrollView style={estilos.pagina} contentContainerStyle={estilos.contenido}>
      <View style={estilos.cabecera}>
        <View style={estilos.identidad}>
          <Text style={estilos.saludo}>Jornada de campo</Text>
          <Text style={estilos.marca}>AquaCampo</Text>
          <Text style={estilos.tecnico}>Técnico {sesion}</Text>
        </View>
        <View style={estilos.casaMini}>
          <View style={estilos.techoMini} />
          <View style={estilos.puertaMini} />
        </View>
        <ConnectionStatus
          conectado={conectado}
          pendientes={pendientes}
          conflictos={conflictos}
          sincronizando={sincronizando}
        />
      </View>

      <View style={estilos.estadisticas}>
        <View style={estilos.estadistica}><Text style={estilos.numero}>{lecturas.length}</Text><Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={estilos.etiqueta}>Lecturas</Text></View>
        <View style={estilos.estadistica}><Text style={estilos.numero}>{pendientes}</Text><Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={estilos.etiqueta}>Pendientes</Text></View>
        <View style={estilos.estadistica}><Text style={estilos.numero}>{enviados}</Text><Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={estilos.etiqueta}>Enviadas</Text></View>
      </View>

      <View style={estilos.avanceTarjeta}>
        <View style={estilos.medidorAvance}>
          <View style={estilos.arcoAvance}>
            <Text style={estilos.porcentaje}>{porcentajeEnviado}%</Text>
            <Text style={estilos.porcentajeEtiqueta}>confirmado</Text>
          </View>
        </View>
        <View style={estilos.avanceContenido}>
          <Text style={estilos.avanceSobreTitulo}>SINCRONIZACIÓN</Text>
          <Text style={estilos.avanceTitulo}>Avance de lecturas</Text>
          <Text style={estilos.descripcion}>
            {enviados} de {lecturas.length} lecturas confirmadas
          </Text>
          <View style={estilos.barraFondo}>
            <View
              style={[
                estilos.barraActiva,
                { width: `${porcentajeEnviado}%` as `${number}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={estilos.tarjetaBusqueda}>
        <Text style={estilos.titulo}>Identificar medidor</Text>
        <Text style={estilos.descripcion}>Ingresa el código impreso en la etiqueta.</Text>
        <TextInput
          autoCapitalize="characters"
          maxLength={10}
          placeholder="MED-123456"
          placeholderTextColor={AquaColores.textoSuave}
          style={estilos.input}
          value={codigo}
          onChangeText={setCodigo}
          onSubmitEditing={consultar}
        />
        <AquaButton titulo="Consultar medidor" onPress={consultar} />
      </View>

      <AquaIllustration />
      <AquaButton
        titulo="Ver lecturas y sincronización"
        onPress={() => router.push("/pendientes")}
        secundario
        style={estilos.botonAncho}
      />
      <AquaButton titulo="Cerrar sesión" onPress={cerrar} peligro style={estilos.botonAncho} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: AquaColores.fondo },
  contenido: { paddingBottom: 38, gap: 18 },
  cabecera: { backgroundColor: AquaColores.marino, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 17, flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  identidad: { flex: 1, minWidth: 190 },
  saludo: { color: AquaColores.celeste, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  marca: { color: AquaColores.blanco, fontSize: 29, fontWeight: "900" },
  tecnico: { color: AquaColores.celeste, marginTop: 3 },
  casaMini: { width: 44, height: 37, marginRight: 7, marginTop: 8, borderRadius: 5, backgroundColor: AquaColores.blanco, borderWidth: 2, borderColor: AquaColores.celeste, alignItems: "center", justifyContent: "flex-end" },
  techoMini: { position: "absolute", top: -10, width: 31, height: 31, borderRadius: 4, backgroundColor: AquaColores.turquesa, transform: [{ rotate: "45deg" }] },
  puertaMini: { width: 12, height: 21, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: AquaColores.marino, zIndex: 1 },
  estadisticas: { marginHorizontal: 18, marginTop: -4, flexDirection: "row", gap: 9 },
  estadistica: { flex: 1, minWidth: 0, backgroundColor: AquaColores.blanco, borderRadius: 18, alignItems: "center", paddingHorizontal: 7, paddingVertical: 14, ...AquaSombra },
  numero: { color: AquaColores.marino, fontSize: 23, fontWeight: "900" },
  etiqueta: { width: "100%", color: AquaColores.textoSuave, textAlign: "center", fontSize: 11, fontWeight: "700" },
  avanceTarjeta: { marginHorizontal: 18, backgroundColor: AquaColores.blanco, borderRadius: 24, padding: 18, flexDirection: "row", alignItems: "center", gap: 17, ...AquaSombra },
  medidorAvance: { width: 92, height: 60, overflow: "hidden", justifyContent: "flex-end" },
  arcoAvance: { width: 92, height: 92, borderRadius: 46, borderWidth: 9, borderColor: AquaColores.turquesa, backgroundColor: AquaColores.celesteSuave, alignItems: "center", paddingTop: 18 },
  porcentaje: { color: AquaColores.marino, fontSize: 20, fontWeight: "900" },
  porcentajeEtiqueta: { color: AquaColores.textoSuave, fontSize: 9, fontWeight: "700" },
  avanceContenido: { flex: 1, minWidth: 0, gap: 3 },
  avanceSobreTitulo: { color: AquaColores.turquesaOscuro, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  avanceTitulo: { color: AquaColores.marino, fontSize: 18, fontWeight: "900" },
  barraFondo: { height: 7, borderRadius: 4, marginTop: 7, backgroundColor: AquaColores.celesteSuave, overflow: "hidden" },
  barraActiva: { height: "100%", borderRadius: 4, backgroundColor: AquaColores.turquesa },
  tarjetaBusqueda: { marginHorizontal: 18, backgroundColor: AquaColores.blanco, borderRadius: 24, padding: 20, gap: 13, ...AquaSombra },
  titulo: { color: AquaColores.marino, fontSize: 22, fontWeight: "900" },
  descripcion: { color: AquaColores.textoSuave },
  input: { borderWidth: 1, borderColor: AquaColores.borde, backgroundColor: "#F8FCFD", borderRadius: 15, padding: 15, color: AquaColores.texto, fontSize: 18, fontWeight: "800", letterSpacing: 1 },
  botonAncho: { marginHorizontal: 18 },
});
