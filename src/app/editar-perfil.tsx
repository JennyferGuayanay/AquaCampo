import * as Clipboard from "expo-clipboard";
import { Redirect, router } from "expo-router";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInRight, FadeInUp, ZoomIn } from "react-native-reanimated";

import { AnimatedTextField } from "../components/AnimatedTextField";
import { AquaButton } from "../components/AquaButton";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { auth } from "../config/firebase";
import { useAqua } from "../context/AquaContext";

function formatearFecha(fecha?: string) {
  if (!fecha) return "No disponible";
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? "No disponible"
    : valor.toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });
}

export default function EditarPerfil() {
  const { sesion, cargando, salir } = useAqua();
  const usuario = auth.currentUser;
  const [nombre, setNombre] = useState(usuario?.displayName ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);

  const iniciales = (usuario?.displayName || usuario?.email || "AC")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  async function guardar() {
    const usuarioActual = auth.currentUser;

    if (!usuarioActual || !usuarioActual.emailVerified) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

    if (nombre.trim().length < 3) {
      Alert.alert("Nombre inválido", "Ingresa al menos 3 caracteres.");
      return;
    }

    setGuardando(true);
    setGuardado(false);

    try {
      await updateProfile(usuarioActual, { displayName: nombre.trim() });
      setGuardado(true);
      Alert.alert("Perfil actualizado", "Tu nombre se guardó correctamente.");
    } catch (error) {
      console.log("Error al actualizar perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre.");
    } finally {
      setGuardando(false);
    }
  }

  async function copiarUid() {
    if (!usuario?.uid) return;
    await Clipboard.setStringAsync(usuario.uid);
    Alert.alert("UID copiado", "El identificador se copió al portapapeles.");
  }

  async function cambiarClave() {
    if (!usuario?.email) return;
    setEnviandoRecuperacion(true);
    try {
      await sendPasswordResetEmail(auth, usuario.email);
      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada para cambiar la contraseña de forma segura.",
      );
    } catch (error) {
      console.log("Error al enviar recuperación:", error);
      Alert.alert("Error", "No se pudo enviar el correo de recuperación.");
    } finally {
      setEnviandoRecuperacion(false);
    }
  }

  async function cerrarSesion() {
    try {
      await salir();
      router.replace("/login");
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  }

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-sky-50">
        <ActivityIndicator size="large" color="#087C98" />
      </View>
    );
  }

  if (!sesion || !usuario?.emailVerified || sesion !== usuario.uid) {
    return <Redirect href="/login" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-sky-50"
    >
      <AquaMotionBackground />
      <ScrollView
        contentContainerClassName="gap-5 p-5 pb-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInRight.duration(500)} className="gap-3 rounded-3xl bg-slate-900 p-6">
          <View className="flex-row items-center gap-4">
            <Animated.View entering={ZoomIn.delay(120).springify().damping(12)} className="h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-200 bg-teal-700 shadow-lg">
              <View className="absolute -right-1 -top-1 h-5 w-5 rounded-full border-2 border-slate-900 bg-emerald-400" />
              <Text className="text-3xl font-black text-white">{iniciales || "AC"}</Text>
            </Animated.View>
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-black tracking-widest text-cyan-200">TÉCNICO AQUACAMPO</Text>
              <Text className="mt-1 text-2xl font-black text-white">
                {usuario.displayName || "Usuario AquaCampo"}
              </Text>
              <Text className="mt-1 text-sm text-cyan-100">{usuario.email}</Text>
            </View>
          </View>
          <ConnectionStatus />
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(100).duration(420)} className="gap-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xl font-black text-slate-900">Información de cuenta</Text>
            <Text className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              {usuario.emailVerified ? "Verificado" : "No verificado"}
            </Text>
          </View>

          <View className="gap-1 rounded-2xl bg-slate-50 p-4">
            <Text className="text-xs font-bold text-slate-500">Correo electrónico</Text>
            <Text selectable className="font-bold text-slate-900">{usuario.email}</Text>
          </View>

          <View className="gap-2 rounded-2xl bg-slate-50 p-4">
            <Text className="text-xs font-bold text-slate-500">Identificador Firebase (UID)</Text>
            <Text selectable className="text-sm font-bold text-slate-900">{usuario.uid}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={copiarUid}
              className="self-start rounded-xl border border-teal-600 bg-cyan-50 px-4 py-2"
            >
              <Text className="font-extrabold text-teal-700">Copiar UID</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1 rounded-2xl bg-cyan-50 p-4">
              <Text className="text-xs font-bold text-slate-500">Cuenta creada</Text>
              <Text className="mt-1 text-sm font-extrabold text-slate-900">
                {formatearFecha(usuario.metadata.creationTime)}
              </Text>
            </View>
            <View className="min-w-0 flex-1 rounded-2xl bg-cyan-50 p-4">
              <Text className="text-xs font-bold text-slate-500">Último acceso</Text>
              <Text className="mt-1 text-sm font-extrabold text-slate-900">
                {formatearFecha(usuario.metadata.lastSignInTime)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(180).duration(450)} className="gap-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <View>
            <Text className="text-xl font-black text-slate-900">Nombre del usuario</Text>
            <Text className="mt-1 text-sm text-slate-500">Este nombre aparece en tu jornada de campo.</Text>
          </View>
          <AnimatedTextField
            placeholder="Tu nombre completo"
            value={nombre}
            onChangeText={(valor) => {
              setNombre(valor);
              setGuardado(false);
            }}
          />
          {guardado && (
            <Text className="rounded-xl bg-emerald-50 p-3 text-center font-bold text-emerald-700">
              Cambios guardados correctamente
            </Text>
          )}
          <AquaButton titulo="Guardar cambios" onPress={guardar} cargando={guardando} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(450)} className="gap-3 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <Text className="text-xl font-black text-slate-900">Seguridad</Text>
          <Text className="text-sm leading-5 text-slate-500">
            Recibirás un enlace de Firebase para cambiar tu contraseña sin exponerla en la aplicación.
          </Text>
          <AquaButton
            titulo="Enviar enlace para cambiar contraseña"
            onPress={cambiarClave}
            cargando={enviandoRecuperacion}
            secundario
          />
        </Animated.View>

        <AquaButton titulo="Regresar al inicio" onPress={() => router.replace("/medidores")} secundario />
        <AquaButton titulo="Cerrar sesión" onPress={cerrarSesion} peligro />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
