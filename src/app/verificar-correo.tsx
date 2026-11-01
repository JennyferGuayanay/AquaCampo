
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  reload,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { auth } from "../config/firebase";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { useAqua } from "../context/AquaContext";

export default function VerificarCorreo() {
  const { entrar } = useAqua();

  const [comprobando, setComprobando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function comprobar() {
    setComprobando(true);

    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert("Sesión caducada", "Inicia sesión nuevamente.");
        router.replace("/login");
        return;
      }

      await reload(usuario);

      if (!usuario.emailVerified) {
        Alert.alert(
          "Verificación pendiente",
          "Todavía no has verificado tu correo electrónico."
        );
        return;
      }

      await entrar(usuario.uid);
      router.replace("/bienvenido");
    } catch (error) {
      console.log("Error verificación:", error);
      Alert.alert(
        "Error",
        "No se pudo comprobar la verificación."
      );
    } finally {
      setComprobando(false);
    }
  }

  async function reenviar() {
    setReenviando(true);

    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert("Error", "Inicia sesión nuevamente.");
        router.replace("/login");
        return;
      }

      await sendEmailVerification(usuario);

      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada y spam."
      );
    } catch (error) {
      console.log("Error reenvío:", error);
      Alert.alert(
        "Error",
        "No se pudo reenviar. Espera unos minutos."
      );
    } finally {
      setReenviando(false);
    }
  }

  async function volver() {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Error al salir:", error);
    }

    router.replace("/login");
  }

  return (
    <View className="flex-1 justify-center bg-sky-50 px-6">
      <AquaMotionBackground />
      <Animated.View entering={FadeInDown.duration(500)}>
        <View className="mb-6 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
            <Text className="text-3xl font-black text-teal-700">@</Text>
          </View>
          <Text className="text-center text-3xl font-black text-slate-900">Verifica tu correo</Text>
          <View className="mt-4"><ConnectionStatus soloConexion /></View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500)}>
        <View className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
          <Text className="mb-3 text-center text-base text-slate-700">
            Enviamos un enlace de verificación a:
          </Text>

          <Text className="mb-5 text-center font-bold text-teal-700">
            {auth.currentUser?.email ?? "Tu correo"}
          </Text>

          <Text className="mb-6 text-center text-slate-600">
            Abre el enlace recibido y luego vuelve
            a AquaCampo para comprobar tu cuenta.
          </Text>

          <Pressable
            onPress={comprobar}
            disabled={comprobando || reenviando}
            className="min-h-14 items-center justify-center rounded-2xl bg-teal-700 p-4"
          >
            {comprobando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-white">
                Ya verifiqué mi correo
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={reenviar}
            disabled={reenviando || comprobando}
            className="mt-5 items-center"
          >
            <Text className="font-semibold text-teal-700">
              {reenviando
                ? "Enviando..."
                : "Reenviar correo de verificación"}
            </Text>
          </Pressable>

          <Pressable onPress={volver} className="mt-6 items-center">
            <Text className="text-slate-500">
              Volver al login
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
