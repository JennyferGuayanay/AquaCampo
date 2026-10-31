
import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  BounceIn,
  ZoomIn,
} from "react-native-reanimated";

import { auth } from "../config/firebase";
import { useAqua } from "../context/AquaContext";

export default function Bienvenido() {
  const { sesion, cargando } = useAqua();

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-sky-50">
        <ActivityIndicator color="#0d9488" size="large" />
      </View>
    );
  }

  if (
    !sesion ||
    !auth.currentUser ||
    !auth.currentUser.emailVerified ||
    sesion !== auth.currentUser.uid
  ) {
    return <Redirect href="/login" />;
  }

  const nombre = auth.currentUser.displayName || "Usuario";

  return (
    <View className="flex-1 items-center justify-center bg-sky-50 px-6">
      <Animated.View entering={BounceIn.duration(700)}>
        <View className="mb-6 items-center">
          <Text className="text-6xl text-teal-600">✓</Text>
        </View>
      </Animated.View>

      <Animated.View entering={ZoomIn.delay(200).duration(500)}>
        <View className="rounded-2xl bg-white p-6">
          <Text className="text-center text-3xl font-bold text-teal-700">
            ¡Bienvenido!
          </Text>

          <Text className="mt-3 text-center text-xl font-semibold">
            {nombre}
          </Text>

          <Text className="mt-5 text-center text-slate-600">
            Tu correo electrónico está verificado.
            Ya puedes utilizar AquaCampo.
          </Text>

          <Pressable
            onPress={() => router.replace("/medidores")}
            className="mt-7 items-center rounded-xl bg-teal-600 p-4"
          >
            <Text className="font-bold text-white">
              Continuar a medidores
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
