import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AquaButton } from "../components/AquaButton";
import { AquaIllustration } from "../components/AquaIllustration";
import { AquaColores, AquaSombra } from "../constants/aquaTheme";
import { useAqua } from "../context/AquaContext";

export default function Login() {
  const { sesion, cargando, entrar } = useAqua();
  const [empleado, setEmpleado] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (cargando) {
    return <View style={estilos.cargando}><ActivityIndicator size="large" color={AquaColores.turquesaOscuro} /></View>;
  }
  if (sesion) return <Redirect href="/medidores" />;

  async function iniciarSesion() {
    if (empleado.trim().toUpperCase() !== "TEC001" || clave !== "123456") {
      Alert.alert("Acceso denegado", "Código o contraseña incorrectos.");
      return;
    }
    setEnviando(true);
    try {
      await entrar("TEC001");
      router.replace("/medidores");
    } catch {
      Alert.alert("Sesión", "No se pudo guardar la sesión en el dispositivo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={estilos.pagina}
    >
      <View pointerEvents="none" style={estilos.formasFondo}>
        <View style={estilos.ondaSuperior} />
        <View style={estilos.ondaSuperiorClara} />
        <View style={estilos.circuloDecorativo} />
        <View style={estilos.ondaInferior} />
      </View>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.columna}>
          <View style={estilos.marcaCaja}>
            <View style={estilos.marcaLinea}>
              <View style={estilos.simboloMarca}>
                <View style={estilos.ondaMarcaUno} />
                <View style={estilos.ondaMarcaDos} />
              </View>
              <Text style={estilos.marca}>AquaCampo</Text>
            </View>
            <Text style={estilos.lema}>
              Gestión de lecturas para jornadas de campo
            </Text>
          </View>

          <View style={estilos.ilustracionCaja}>
            <AquaIllustration compacta />
          </View>

          <View style={estilos.tarjeta}>
            <View style={estilos.tituloCaja}>
              <Text style={estilos.sobreTitulo}>ACCESO SEGURO</Text>
              <Text style={estilos.titulo}>Inicia tu jornada</Text>
              <Text style={estilos.descripcion}>
                Tus lecturas permanecerán disponibles aunque pierdas la conexión.
              </Text>
            </View>

            <View style={estilos.campo}>
              <Text style={estilos.etiqueta}>Código de empleado</Text>
              <TextInput
                autoCapitalize="characters"
                autoComplete="username"
                placeholder="Ej. TEC001"
                placeholderTextColor={AquaColores.textoSuave}
                returnKeyType="next"
                style={estilos.input}
                value={empleado}
                onChangeText={setEmpleado}
              />
            </View>

            <View style={estilos.campo}>
              <Text style={estilos.etiqueta}>Contraseña</Text>
              <TextInput
                autoComplete="password"
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={AquaColores.textoSuave}
                returnKeyType="done"
                secureTextEntry
                style={estilos.input}
                value={clave}
                onChangeText={setClave}
                onSubmitEditing={iniciarSesion}
              />
            </View>

            <AquaButton
              titulo="Ingresar a AquaCampo"
              onPress={iniciarSesion}
              cargando={enviando}
            />
            <Text style={estilos.pieFormulario}>
              Acceso exclusivo para personal técnico autorizado
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: AquaColores.blanco },
  formasFondo: { ...StyleSheet.absoluteFill, overflow: "hidden" },
  ondaSuperior: {
    position: "absolute",
    top: -128,
    left: -80,
    width: 470,
    height: 235,
    borderRadius: 180,
    backgroundColor: AquaColores.celeste,
    transform: [{ rotate: "-8deg" }],
  },
  ondaSuperiorClara: {
    position: "absolute",
    top: -110,
    right: -160,
    width: 400,
    height: 230,
    borderRadius: 180,
    backgroundColor: AquaColores.celesteSuave,
    transform: [{ rotate: "12deg" }],
  },
  circuloDecorativo: {
    position: "absolute",
    top: 112,
    right: -24,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 18,
    borderColor: AquaColores.celesteSuave,
  },
  ondaInferior: {
    position: "absolute",
    bottom: -160,
    left: -90,
    width: 520,
    height: 220,
    borderRadius: 180,
    backgroundColor: AquaColores.fondoProfundo,
    transform: [{ rotate: "5deg" }],
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 30,
  },
  columna: { width: "100%", maxWidth: 420, alignSelf: "center" },
  marcaCaja: { alignItems: "center", paddingHorizontal: 12 },
  marcaLinea: { flexDirection: "row", alignItems: "center", gap: 10 },
  simboloMarca: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: AquaColores.marino,
    justifyContent: "center",
    paddingHorizontal: 7,
    gap: 4,
  },
  ondaMarcaUno: { height: 3, borderRadius: 2, backgroundColor: AquaColores.celeste },
  ondaMarcaDos: { width: "72%", height: 3, borderRadius: 2, backgroundColor: AquaColores.turquesa, alignSelf: "flex-end" },
  marca: { color: AquaColores.marino, fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  lema: { color: AquaColores.textoSuave, textAlign: "center", marginTop: 7, lineHeight: 20, fontWeight: "600" },
  ilustracionCaja: { height: 154, justifyContent: "center", marginVertical: 2 },
  tarjeta: {
    backgroundColor: AquaColores.blanco,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AquaColores.linea,
    padding: 22,
    gap: 16,
    ...AquaSombra,
  },
  tituloCaja: { gap: 5 },
  sobreTitulo: { color: AquaColores.turquesaOscuro, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  titulo: { color: AquaColores.marino, fontSize: 25, fontWeight: "900", letterSpacing: -0.4 },
  descripcion: { color: AquaColores.textoSuave, lineHeight: 20 },
  campo: { gap: 7 },
  etiqueta: { color: AquaColores.texto, fontSize: 13, fontWeight: "800" },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: AquaColores.borde,
    backgroundColor: AquaColores.celesteSuave,
    borderRadius: 15,
    paddingHorizontal: 15,
    color: AquaColores.texto,
    fontSize: 16,
  },
  pieFormulario: { color: AquaColores.textoSuave, fontSize: 11, textAlign: "center", lineHeight: 16 },
  cargando: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: AquaColores.blanco },
});
