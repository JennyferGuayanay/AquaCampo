
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { AnimatedTextField } from "../components/AnimatedTextField";
import { AquaButton } from "../components/AquaButton";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { FieldTechnicianIllustration } from "../components/FieldTechnicianIllustration";
import { auth } from "../config/firebase";

export default function CrearCuenta() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [enviando, setEnviando] = useState(false);

  const requisitosClave = [
    {
      texto: "Entre 8 y 12 caracteres",
      cumplido: clave.length >= 8 && clave.length <= 12,
    },
    { texto: "Una letra mayúscula", cumplido: /[A-Z]/.test(clave) },
    { texto: "Una letra minúscula", cumplido: /[a-z]/.test(clave) },
    { texto: "Un número", cumplido: /[0-9]/.test(clave) },
    {
      texto: "Un carácter especial (por ejemplo: @, #, $, !, % o *)",
      cumplido: /[^A-Za-z0-9\s]/.test(clave),
    },
  ];

  const puntos = requisitosClave.filter(({ cumplido }) => cumplido).length;
  const cumpleRequisitosClave = requisitosClave.every(
    ({ cumplido }) => cumplido
  );

  const seguridad =
    clave.length === 0
      ? "Sin evaluar"
      : cumpleRequisitosClave
        ? "Fuerte"
        : puntos <= 2
          ? "Débil"
          : "Media";

  const colorSeguridad =
    seguridad === "Débil"
      ? "text-red-600"
      : seguridad === "Media"
        ? "text-amber-600"
        : seguridad === "Fuerte"
          ? "text-teal-600"
          : "text-slate-500";

  async function registrar() {
    if (
      !nombre.trim() ||
      !correo.trim() ||
      !clave ||
      !confirmacion
    ) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      Alert.alert("Error", "Ingresa un correo válido.");
      return;
    }

    if (!cumpleRequisitosClave) {
      Alert.alert(
        "Contraseña insegura",
        clave.length > 12
          ? "La contraseña supera el máximo de 12 caracteres."
          : "Usa entre 8 y 12 caracteres, mayúscula, minúscula, número y carácter especial."
      );
      return;
    }

    if (clave !== confirmacion) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);

    try {
      const resultado = await createUserWithEmailAndPassword(
        auth,
        correo.trim().toLowerCase(),
        clave
      );

      await updateProfile(resultado.user, {
        displayName: nombre.trim(),
      });

      await sendEmailVerification(resultado.user);

      router.replace("/verificar-correo");
    } catch (error: unknown) {
      const codigo =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String(error.code)
          : "";

      if (codigo === "auth/email-already-in-use") {
        Alert.alert("Error", "Este correo ya está registrado.");
      } else {
        console.log("Error registro:", error);
        Alert.alert(
          "Error",
          "No se pudo completar el registro o enviar la verificación. Comprueba tu conexión."
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View className="flex-1 bg-sky-50">
      <AquaMotionBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerClassName="px-6 py-12"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(650)}>
            <View className="items-center">
              <Text className="text-xs font-black tracking-[3px] text-teal-700">AQUACAMPO</Text>
              <Text className="mt-2 text-center text-3xl font-black text-slate-900">Crear cuenta</Text>
              <Text className="mt-2 text-center text-slate-600">
                Prepara tu perfil para una jornada conectada.
              </Text>
              <View className="mt-4"><ConnectionStatus soloConexion /></View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(80).duration(600)}
            className="my-4 overflow-hidden rounded-3xl border border-white/80 bg-white/70 px-3"
          >
            <FieldTechnicianIllustration />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(160).springify().damping(15)}>
            <View className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-lg">
          <Text className="mb-2 font-semibold">
            Nombre completo
          </Text>
          <AnimatedTextField
            containerClassName="mb-4"
            placeholder="Nombre y apellido"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text className="mb-2 font-semibold">
            Correo electrónico
          </Text>
          <AnimatedTextField
            containerClassName="mb-4"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />

          <Text className="mb-2 font-semibold">
            Contraseña
          </Text>
          <AnimatedTextField
            placeholder="Contraseña"
            secureTextEntry
            value={clave}
            onChangeText={setClave}
          />

          <Text className={`mb-2 mt-3 font-bold ${colorSeguridad}`}>
            Seguridad: {seguridad}
          </Text>

          <View className="mb-4 flex-row gap-2">
            {[1, 2, 3, 4, 5].map((paso) => (
              <View
                key={paso}
                className={`h-2 flex-1 rounded-full ${
                  paso <= puntos
                    ? seguridad === "Fuerte"
                      ? "bg-teal-600"
                      : seguridad === "Media"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </View>

          <View className="mb-4 gap-1">
            {requisitosClave.map(({ texto, cumplido }) => (
              <Text
                key={texto}
                className={`text-xs ${
                  cumplido ? "text-teal-700" : "text-slate-500"
                }`}
              >
                {cumplido ? "Cumplido" : "Pendiente"}: {texto}
              </Text>
            ))}
            {clave.length > 12 && (
              <Text className="text-xs font-semibold text-red-600">
                Supera la longitud máxima permitida de 12 caracteres.
              </Text>
            )}
          </View>

          <Text className="mb-2 font-semibold">
            Confirmar contraseña
          </Text>
          <AnimatedTextField
            containerClassName="mb-5"
            placeholder="Repetir contraseña"
            secureTextEntry
            value={confirmacion}
            onChangeText={setConfirmacion}
          />

          <AquaButton titulo="Registrarme" onPress={registrar} cargando={enviando} />

          <Pressable
            onPress={() => router.replace("/login")}
            className="mt-5 items-center"
          >
            <Text className="text-teal-700">
              Volver al login
            </Text>
          </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
