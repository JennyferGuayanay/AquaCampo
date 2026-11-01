
import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { sendPasswordResetEmail } from "firebase/auth";

import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { auth } from "../config/firebase";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";

export default function RecuperarClave() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function recuperar() {
    const correo = email.trim().toLowerCase();

    if (!correo) {
      Alert.alert(
        "Correo obligatorio",
        "Ingresa el correo asociado a tu cuenta."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      Alert.alert(
        "Correo inválido",
        "Ingresa una dirección de correo válida."
      );
      return;
    }

    setEnviando(true);

    try {
      await sendPasswordResetEmail(auth, correo);
      setEnviado(true);
    } catch (error: unknown) {
      const codigo =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String(error.code)
          : "";

      console.log("Error recuperación Firebase:", error);

      if (codigo === "auth/invalid-email") {
        Alert.alert(
          "Correo inválido",
          "Comprueba la dirección ingresada."
        );
      } else if (codigo === "auth/too-many-requests") {
        Alert.alert(
          "Demasiados intentos",
          "Espera unos minutos antes de intentarlo nuevamente."
        );
      } else {
        Alert.alert(
          "No se pudo procesar la solicitud",
          "Comprueba tu conexión e inténtalo nuevamente."
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-sky-50"
    >
      <AquaMotionBackground />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-grow justify-center px-6 py-12"
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-teal-700">
              <Text className="text-3xl font-black text-white">
                A
              </Text>
            </View>

            <Text className="text-center text-3xl font-black text-slate-900">
              Recuperar contraseña
            </Text>

            <Text className="mt-3 text-center text-sm text-slate-500">
              Recupera el acceso a tu cuenta AquaCampo
            </Text>
            <View className="mt-4"><ConnectionStatus soloConexion /></View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(600)}>
          <View className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
            {enviado ? (
              <>
                <Text className="mb-3 text-2xl font-black text-teal-700">
                  Revisa tu correo
                </Text>

                <Text className="mb-4 leading-6 text-slate-600">
                  Si existe una cuenta asociada a ese correo,
                  recibirás un enlace para restablecer tu contraseña.
                </Text>

                <Text className="mb-6 text-sm text-slate-500">
                  Revisa también la carpeta de spam o correo no deseado.
                </Text>

                <Pressable
                  onPress={() => router.replace("/login")}
                  className="items-center rounded-2xl bg-teal-600 px-5 py-4"
                >
                  <Text className="font-extrabold text-white">
                    Volver al inicio de sesión
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setEnviado(false)}
                  className="mt-5 items-center"
                >
                  <Text className="font-semibold text-teal-700">
                    Intentar con otro correo
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="mb-3 text-2xl font-black text-slate-900">
                  ¿Olvidaste tu clave?
                </Text>

                <Text className="mb-7 leading-6 text-slate-500">
                  Ingresa tu correo electrónico y te enviaremos
                  las instrucciones para crear una nueva contraseña.
                </Text>

                <Text className="mb-2 font-bold text-slate-700">
                  Correo electrónico
                </Text>

                <TextInput
                  className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />

                <Pressable
                  onPress={recuperar}
                  disabled={enviando}
                  className="min-h-14 items-center justify-center rounded-2xl bg-teal-600 px-5 py-4"
                >
                  {enviando ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="font-extrabold text-white">
                      Enviar enlace de recuperación
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => router.replace("/login")}
                  className="mt-6 items-center"
                >
                  <Text className="font-semibold text-teal-700">
                    Volver al inicio de sesión
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
