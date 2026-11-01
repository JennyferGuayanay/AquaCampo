import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

import { AquaButton } from "../components/AquaButton";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { MeterCard } from "../components/MeterCard";
import { useAqua } from "../context/AquaContext";
import { useMedidor } from "../hooks/useMedidor";
import { validarCodigo } from "../utils/rules";

export default function Detalle() {
  const parametros = useLocalSearchParams<{ codigo?: string }>();
  const codigo = typeof parametros.codigo === "string" ? parametros.codigo : "";
  const { sesion, cargando: cargandoSesion, conectado } = useAqua();
  const { medidor, cargando, error, recargar } = useMedidor(codigo);

  if (cargandoSesion) {
    return (
      <View className="flex-1 items-center justify-center bg-sky-50">
        <ActivityIndicator size="large" color="#087C98" />
      </View>
    );
  }
  if (!sesion) return <Redirect href="/login" />;

  if (!validarCodigo(codigo)) {
    return (
      <View className="flex-1 items-center justify-center gap-5 bg-sky-50 p-6">
        <Text className="text-center text-2xl font-black text-slate-900">
          Código no válido
        </Text>
        <AquaButton titulo="Volver al panel" onPress={() => router.replace("/medidores")} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-sky-50"
      contentContainerClassName="flex-grow gap-4 p-5 pb-12"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(450)} className="gap-2">
        <Text className="text-xs font-black tracking-widest text-teal-700">
          CONSULTA DE CAMPO
        </Text>
        <Text className="text-3xl font-black text-slate-900">Detalle del medidor</Text>
        <ConnectionStatus />
      </Animated.View>

      {cargando ? (
        <View className="min-h-64 flex-1 items-center justify-center gap-4">
          <ActivityIndicator size="large" color="#087C98" />
          <Text className="text-center leading-6 text-slate-500">
            Consultando información del medidor...
          </Text>
        </View>
      ) : medidor ? (
        <Animated.View entering={FadeInUp.delay(100).duration(450)} className="gap-4">
          <MeterCard medidor={medidor} />
          <AquaButton
            titulo="Registrar lectura"
            onPress={() => router.push({ pathname: "/registro", params: { codigo } })}
          />
          {conectado && (
            <AquaButton titulo="Actualizar datos" onPress={() => void recargar()} secundario />
          )}
        </Animated.View>
      ) : (
        <Animated.View
          entering={ZoomIn.duration(400)}
          className="gap-4 rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm"
        >
          <Text className="text-center text-2xl font-black text-slate-900">
            {conectado ? "Medidor no encontrado" : "Registro sin datos previos"}
          </Text>
          <Text className="text-center leading-6 text-slate-500">{error}</Text>
          {!conectado && (
            <>
              <Text className="text-center leading-6 text-slate-500">
                Puedes guardar la lectura. Se verificará automáticamente al recuperar la conexión.
              </Text>
              <AquaButton
                titulo="Registrar para verificar después"
                onPress={() => router.push({ pathname: "/registro", params: { codigo } })}
              />
            </>
          )}
          {conectado && (
            <AquaButton titulo="Intentar otra vez" onPress={() => void recargar()} secundario />
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
}
