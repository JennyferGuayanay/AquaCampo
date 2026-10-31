
import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { updateProfile } from "firebase/auth";
import Animated, {
  FadeInRight,
  ZoomIn,
} from "react-native-reanimated";

import { auth } from "../config/firebase";
import { useAqua } from "../context/AquaContext";

export default function EditarPerfil() {
  const { sesion, cargando } = useAqua();
  const [nombre, setNombre] = useState(
    auth.currentUser?.displayName ?? ""
  );
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const usuario = auth.currentUser;

    if (!usuario || !usuario.emailVerified) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

    if (nombre.trim().length < 3) {
      Alert.alert(
        "Nombre inválido",
        "Ingresa al menos 3 caracteres."
      );
      return;
    }

    setGuardando(true);

    try {
      await updateProfile(usuario, {
        displayName: nombre.trim(),
      });

      Alert.alert(
        "Perfil actualizado",
        "Tu nombre se guardó correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log("Error al actualizar perfil:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar el nombre."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  if (
    !sesion ||
    !auth.currentUser?.emailVerified ||
    sesion !== auth.currentUser.uid
  ) {
    return <Redirect href="/login" />;
  }

  return (
    <View className="flex-1 justify-center bg-sky-50 px-6">
      <Animated.View entering={FadeInRight.duration(500)}>
        <Text className="mb-6 text-center text-3xl font-bold text-teal-700">
          Mi perfil
        </Text>
      </Animated.View>

      <Animated.View entering={ZoomIn.delay(150).duration(450)}>
        <View className="rounded-2xl bg-white p-6">
          <Text className="mb-2 font-semibold">
            Correo electrónico
          </Text>

          <Text className="mb-6 text-slate-600">
            {auth.currentUser.email}
          </Text>

          <Text className="mb-2 font-semibold">
            Nombre del usuario
          </Text>

          <TextInput
            className="mb-6 rounded-xl border border-slate-300 p-3"
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
          />

          <Pressable
            onPress={guardar}
            disabled={guardando}
            className="items-center rounded-xl bg-teal-600 p-4"
          >
            {guardando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-white">
                Guardar cambios
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="mt-5 items-center"
          >
            <Text className="text-teal-700">
              Volver
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
