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
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.marcaCaja}>
          <Text style={estilos.marca}>AquaCampo</Text>
          <Text style={estilos.lema}>Lecturas confiables, incluso sin conexión</Text>
        </View>
        <AquaIllustration />
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Acceso de campo</Text>
          <Text style={estilos.descripcion}>
            Ingresa tus credenciales para continuar con la jornada.
          </Text>
          <TextInput
            autoCapitalize="characters"
            autoComplete="username"
            placeholder="Código de empleado"
            placeholderTextColor={AquaColores.textoSuave}
            style={estilos.input}
            value={empleado}
            onChangeText={setEmpleado}
          />
          <TextInput
            autoComplete="password"
            placeholder="Contraseña"
            placeholderTextColor={AquaColores.textoSuave}
            secureTextEntry
            style={estilos.input}
            value={clave}
            onChangeText={setClave}
            onSubmitEditing={iniciarSesion}
          />
          <AquaButton titulo="Iniciar jornada" onPress={iniciarSesion} cargando={enviando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: AquaColores.fondo },
  contenido: { flexGrow: 1, justifyContent: "center", padding: 24, paddingVertical: 45 },
  marcaCaja: { alignItems: "center" },
  marca: { color: AquaColores.marino, fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  lema: { color: AquaColores.turquesaOscuro, textAlign: "center", marginTop: 4, fontWeight: "600" },
  tarjeta: { backgroundColor: AquaColores.blanco, borderRadius: 26, padding: 22, gap: 14, ...AquaSombra },
  titulo: { color: AquaColores.marino, fontSize: 24, fontWeight: "900" },
  descripcion: { color: AquaColores.textoSuave, lineHeight: 21 },
  input: { borderWidth: 1, borderColor: AquaColores.borde, backgroundColor: "#F8FCFD", borderRadius: 15, padding: 15, color: AquaColores.texto, fontSize: 16 },
  cargando: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: AquaColores.fondo },
});
