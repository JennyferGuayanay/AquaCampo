import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { AquaIllustration } from "../components/AquaIllustration";
import { useAqua } from "../context/AquaContext";

export default function Inicio() {
  const { sesion, cargando } = useAqua();

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Animated.View entering={FadeInDown.duration(450)} className="items-center">
          <Text className="text-4xl font-black tracking-tight text-slate-900">AquaCampo</Text>
          <Text className="mt-1 font-semibold text-slate-500">
            Preparando tu jornada de campo
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(80).duration(450)}>
          <AquaIllustration compacta />
        </Animated.View>
        <ActivityIndicator size="large" color="#087C98" />
        <View className="mt-4 h-1 w-28 overflow-hidden rounded-full bg-cyan-50">
          <View className="h-full w-16 rounded-full bg-teal-500" />
        </View>
      </View>
    );
  }

  return <Redirect href={sesion ? "/medidores" : "/login"} />;
}
