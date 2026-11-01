
import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  BounceIn,
  ZoomIn,
} from "react-native-reanimated";

import { AquaButton } from "../components/AquaButton";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { VerificationCelebration } from "../components/VerificationCelebration";
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
    <View className="flex-1 bg-sky-50">
      <AquaMotionBackground />
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center px-6 py-10"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={BounceIn.duration(700)}>
          <VerificationCelebration />
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(200).duration(500)} className="w-full">
          <View className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-lg">
          <Text className="text-center text-3xl font-black text-slate-900">
            ¡Bienvenido!
          </Text>

          <Text className="mt-3 text-center text-xl font-semibold">
            {nombre}
          </Text>

          <Text className="mt-5 text-center text-slate-600">
            Tu correo electrónico está verificado.
            Ya puedes utilizar AquaCampo.
          </Text>

          <View className="mt-5 items-center">
            <ConnectionStatus />
          </View>

            <View className="mt-7">
              <AquaButton
                titulo="Continuar a medidores"
                onPress={() => router.replace("/medidores")}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
