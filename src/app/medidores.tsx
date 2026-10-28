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
        <View style={{ flex: 1 }}>
          <Text style={estilos.saludo}>Jornada de campo</Text>
          <Text style={estilos.marca}>AquaCampo</Text>
          <Text style={estilos.tecnico}>Técnico {sesion}</Text>
        </View>
        <View style={estilos.gotaMini} />
        <ConnectionStatus
          conectado={conectado}
          pendientes={pendientes}
          conflictos={conflictos}
          sincronizando={sincronizando}
        />
      </View>

      <View style={estilos.estadisticas}>
        <View style={estilos.estadistica}><Text style={estilos.numero}>{lecturas.length}</Text><Text style={estilos.etiqueta}>Lecturas</Text></View>
        <View style={estilos.estadistica}><Text style={estilos.numero}>{pendientes}</Text><Text style={estilos.etiqueta}>Pendientes</Text></View>
        <View style={estilos.estadistica}><Text style={estilos.numero}>{enviados}</Text><Text style={estilos.etiqueta}>Enviadas</Text></View>
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
  cabecera: { backgroundColor: AquaColores.marino, paddingHorizontal: 22, paddingTop: 54, paddingBottom: 18, flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  saludo: { color: AquaColores.celeste, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  marca: { color: AquaColores.blanco, fontSize: 29, fontWeight: "900" },
  tecnico: { color: AquaColores.celeste, marginTop: 3 },
  gotaMini: { width: 42, height: 42, borderTopLeftRadius: 25, borderTopRightRadius: 25, borderBottomLeftRadius: 25, backgroundColor: AquaColores.turquesa, transform: [{ rotate: "45deg" }], marginRight: 8 },
  estadisticas: { marginHorizontal: 18, marginTop: -4, flexDirection: "row", gap: 9 },
  estadistica: { flex: 1, backgroundColor: AquaColores.blanco, borderRadius: 18, alignItems: "center", padding: 14, ...AquaSombra },
  numero: { color: AquaColores.marino, fontSize: 23, fontWeight: "900" },
  etiqueta: { color: AquaColores.textoSuave, fontSize: 11, fontWeight: "700" },
  tarjetaBusqueda: { marginHorizontal: 18, backgroundColor: AquaColores.blanco, borderRadius: 24, padding: 20, gap: 13, ...AquaSombra },
  titulo: { color: AquaColores.marino, fontSize: 22, fontWeight: "900" },
  descripcion: { color: AquaColores.textoSuave },
  input: { borderWidth: 1, borderColor: AquaColores.borde, backgroundColor: "#F8FCFD", borderRadius: 15, padding: 15, color: AquaColores.texto, fontSize: 18, fontWeight: "800", letterSpacing: 1 },
  botonAncho: { marginHorizontal: 18 },
});
