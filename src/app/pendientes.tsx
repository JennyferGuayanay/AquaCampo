import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

import { AquaButton } from "../components/AquaButton";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { useAqua } from "../context/AquaContext";
import type { EstadoSync, Lectura } from "../types/models";

const etiquetas: Record<EstadoSync, string> = {
  pendiente: "Pendiente de envío",
  enviando: "Preparando envío",
  incierto: "Envío por confirmar",
  conflicto: "Requiere revisión",
  enviado: "Enviado y bloqueado",
};

const barras: Record<EstadoSync, string> = {
  pendiente: "bg-sky-500",
  enviando: "bg-blue-700",
  incierto: "bg-amber-500",
  conflicto: "bg-red-600",
  enviado: "bg-emerald-600",
};

const insignias: Record<EstadoSync, string> = {
  pendiente: "bg-cyan-100",
  enviando: "bg-blue-100",
  incierto: "bg-amber-100",
  conflicto: "bg-red-100",
  enviado: "bg-emerald-100",
};

function permiteEdicion(lectura: Lectura) {
  if (lectura.estadoSync === "pendiente") return true;
  return (
    lectura.estadoSync === "conflicto" &&
    lectura.conflicto?.tipo !== "duplicado_remoto"
  );
}

export default function Pendientes() {
  const {
    sesion,
    cargando,
    conectado,
    lecturas,
    sincronizando,
    actualizar,
    sincronizar,
  } = useAqua();
  useFocusEffect(
    useCallback(() => {
      void actualizar();
    }, [actualizar]),
  );

  if (cargando) {
    return <View className="flex-1 items-center justify-center bg-sky-50"><ActivityIndicator size="large" color="#087C98" /></View>;
  }
  if (!sesion) return <Redirect href="/login" />;

  async function ejecutarSync() {
    if (!conectado) {
      Alert.alert("Sin conexión", "Las lecturas permanecen guardadas en el dispositivo.");
      return;
    }
    const resultado = await sincronizar();
    if (!resultado) return;
    Alert.alert(
      "Sincronización terminada",
      `Confirmadas: ${resultado.enviados}\n` +
        `Revisión: ${resultado.verificacion}\n` +
        `Conflictos: ${resultado.conflictos}\n` +
        `Envíos inciertos: ${resultado.inciertos}\n` +
        `Errores: ${resultado.errores}`,
    );
  }

  return (
    <View className="flex-1 bg-sky-50">
      <AquaMotionBackground />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
      <Animated.View entering={FadeInDown.duration(450)} className="gap-3 rounded-3xl bg-slate-900 p-5">
        <Text className="text-2xl font-black text-white">Estado de la jornada</Text>
        <ConnectionStatus />
        <Text className="mt-1 text-sm leading-5 text-cyan-100">
          Los envíos inciertos se verifican en MockAPI por su identificador local antes de volver a intentarse.
        </Text>
      </Animated.View>

      {lecturas.length === 0 && (
        <Animated.View entering={ZoomIn.duration(400)} className="items-center gap-2 rounded-3xl border border-cyan-100 bg-white p-6">
          <Text className="text-xl font-black text-slate-900">Aún no hay lecturas</Text>
          <Text className="text-center text-slate-500">Registra un medidor desde el panel principal.</Text>
        </Animated.View>
      )}

      {lecturas.length > 0 && (
        <View className="mt-1 flex-row items-center justify-between px-1">
          <View>
            <Text className="text-[10px] font-black tracking-widest text-teal-700">REGISTROS DE CAMPO</Text>
            <Text className="mt-1 text-xl font-black text-slate-900">Lecturas registradas</Text>
          </View>
          <View className="h-9 min-w-9 items-center justify-center rounded-full bg-cyan-200">
            <Text className="font-black text-slate-900">{lecturas.length}</Text>
          </View>
        </View>
      )}

      {lecturas.map((lectura, indice) => (
        <Animated.View
          entering={FadeInUp.delay(Math.min(indice, 4) * 70).duration(400)}
          key={lectura.idLocal}
          className="overflow-hidden rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm"
        >
          <View className={`-mx-5 -mt-5 mb-4 h-1.5 ${barras[lectura.estadoSync]}`} />
          <View className="flex-row flex-wrap items-center gap-3">
            <View className="min-w-0 flex-1">
              <Text className="shrink text-xl font-black text-slate-900">{lectura.codigoMedidor}</Text>
              <Text className="text-xs text-slate-500">{lectura.mes}</Text>
            </View>
            <View className={`max-w-40 shrink rounded-xl px-3 py-2 ${insignias[lectura.estadoSync]}`}>
              <Text className="text-center text-[11px] font-black text-slate-900">{etiquetas[lectura.estadoSync]}</Text>
            </View>
          </View>
          <View className="mt-4 flex-row gap-2">
            <View className="min-w-0 flex-1 gap-1 rounded-xl bg-slate-50 px-2 py-3">
              <Text className="text-[10px] font-bold text-slate-500">Estado</Text>
              <Text className="shrink text-sm font-black capitalize text-slate-900">{lectura.estadoMedidor}</Text>
            </View>
            <View className="min-w-0 flex-1 gap-1 rounded-xl bg-slate-50 px-2 py-3">
              <Text className="text-[10px] font-bold text-slate-500">Lectura</Text>
              <Text className="shrink text-sm font-black text-slate-900">{lectura.lecturaActual ?? "No disponible"}</Text>
            </View>
            <View className="min-w-0 flex-1 gap-1 rounded-xl bg-slate-50 px-2 py-3">
              <Text className="text-[10px] font-bold text-slate-500">Consumo</Text>
              <Text className="shrink text-sm font-black text-slate-900">{lectura.consumo === null ? "Pendiente" : `${lectura.consumo} m³`}</Text>
            </View>
          </View>
          {lectura.conflicto && (
            <View className="mt-4 gap-1 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Text className="font-black text-amber-900">Acción necesaria</Text>
              <Text className="leading-5 text-amber-900">{lectura.conflicto.detalle}</Text>
            </View>
          )}
          {lectura.estadoSync === "incierto" && (
            <Text className="mt-4 italic leading-5 text-slate-500">
              El POST pudo haber llegado al servidor. No se repetirá hasta consultar los registros remotos.
            </Text>
          )}
          {lectura.fotoUri && (
            <Image source={{ uri: lectura.fotoUri }} className="mt-4 h-44 w-full rounded-2xl" resizeMode="cover" />
          )}
          {permiteEdicion(lectura) && (
            <View className="mt-4">
              <AquaButton
                titulo={lectura.estadoSync === "conflicto" ? "Revisar y corregir" : "Editar lectura pendiente"}
                onPress={() =>
                  router.push({
                    pathname: "/registro",
                    params: { codigo: lectura.codigoMedidor, idLocal: lectura.idLocal },
                  })
                }
                secundario
              />
            </View>
          )}
        </Animated.View>
      ))}

      <AquaButton titulo="Actualizar y sincronizar" onPress={ejecutarSync} cargando={sincronizando} />
      <AquaButton titulo="Volver al panel" onPress={() => router.dismissTo("/medidores")} secundario />
      </ScrollView>
    </View>
  );
}
