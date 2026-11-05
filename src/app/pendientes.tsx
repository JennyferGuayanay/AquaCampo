import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

import { AquaButton } from "../components/AquaButton";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { LeafletMap } from "../components/LeafletMap";
import { SyncSuccessAnimation } from "../components/SyncSuccessAnimation";
import { useAqua } from "../context/AquaContext";
import type { EstadoSync, Lectura } from "../types/models";
import { sonCoordenadasValidas } from "../utils/rules";

const etiquetas: Record<EstadoSync, string> = {
  pendiente: "Pendiente de envío",
  enviando: "Preparando envío",
  incierto: "Envío por confirmar",
  conflicto: "Requiere revisión",
  enviado: "Enviado y bloqueado",
};

const barras: Record<EstadoSync, string> = {
  pendiente: "bg-aqua-turquesa",
  enviando: "bg-blue-700",
  incierto: "bg-amber-500",
  conflicto: "bg-red-600",
  enviado: "bg-emerald-600",
};

const insignias: Record<EstadoSync, string> = {
  pendiente: "bg-aqua-celeste",
  enviando: "bg-blue-50",
  incierto: "bg-amber-50",
  conflicto: "bg-red-50",
  enviado: "bg-emerald-50",
};

const textoInsignias: Record<EstadoSync, string> = {
  pendiente: "text-aqua-marino",
  enviando: "text-blue-900",
  incierto: "text-amber-900",
  conflicto: "text-red-900",
  enviado: "text-emerald-900",
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
  const [mapaAbierto, setMapaAbierto] = useState<string | null>(null);
  const [mostrarExitoSync, setMostrarExitoSync] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void actualizar();
    }, [actualizar]),
  );

  if (cargando) {
    return <View className="flex-1 items-center justify-center bg-aqua-fondo"><ActivityIndicator size="large" color="#087E91" /></View>;
  }
  if (!sesion) return <Redirect href="/login" />;

  async function ejecutarSync() {
    if (!conectado) {
      Alert.alert("Sin conexión", "Las lecturas permanecen guardadas en el dispositivo.");
      return;
    }
    const resultado = await sincronizar();
    if (!resultado) return;
    const sincronizacionCompleta =
      resultado.errores === 0 &&
      resultado.conflictos === 0 &&
      resultado.inciertos === 0 &&
      resultado.enviados + resultado.verificacion > 0;
    if (sincronizacionCompleta) {
      setMostrarExitoSync(true);
      return;
    }
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
    <View className="flex-1 bg-aqua-fondo">
      <AquaMotionBackground />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 py-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
      <Animated.View entering={FadeInDown.duration(450)} className="gap-3 rounded-3xl border border-white/10 bg-aqua-marino p-5">
        <Text className="text-2xl font-black tracking-tight text-white">Estado de la jornada</Text>
        <ConnectionStatus />
        <Text className="mt-1 text-sm leading-5 text-cyan-100">
          Los envíos inciertos se verifican en MockAPI por su identificador local antes de volver a intentarse.
        </Text>
      </Animated.View>

      {lecturas.length === 0 && (
        <Animated.View entering={ZoomIn.duration(400)} className="items-center gap-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Text className="text-xl font-black text-aqua-marino">Aún no hay lecturas</Text>
          <Text className="text-center text-slate-500">Registra un medidor desde el panel principal.</Text>
        </Animated.View>
      )}

      {lecturas.length > 0 && (
        <View className="mt-1 flex-row items-center justify-between px-1">
          <View>
            <Text className="text-[10px] font-black tracking-[1.5px] text-aqua-turquesa">REGISTROS DE CAMPO</Text>
            <Text className="mt-1 text-xl font-black text-aqua-marino">Lecturas registradas</Text>
          </View>
          <View className="h-9 min-w-9 items-center justify-center rounded-2xl bg-aqua-celeste px-2">
            <Text className="font-black text-aqua-marino">{lecturas.length}</Text>
          </View>
        </View>
      )}

      {lecturas.map((lectura, indice) => (
        <Animated.View
          entering={FadeInUp.delay(Math.min(indice, 4) * 70).duration(400)}
          key={lectura.idLocal}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <View className={`-mx-4 -mt-4 mb-4 h-1 ${barras[lectura.estadoSync]}`} />
          <View className="flex-row flex-wrap items-center gap-3">
            <View className="min-w-0 flex-1">
              <Text className="shrink text-xl font-black tracking-tight text-aqua-marino">{lectura.codigoMedidor}</Text>
              <Text className="text-xs text-slate-500">{lectura.mes}</Text>
            </View>
            <View className={`max-w-40 shrink rounded-xl border border-slate-100 px-3 py-2 ${insignias[lectura.estadoSync]}`}>
              <Text className={`text-center text-[11px] font-black ${textoInsignias[lectura.estadoSync]}`}>{etiquetas[lectura.estadoSync]}</Text>
            </View>
          </View>
          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="min-w-[30%] flex-1 gap-1 rounded-2xl border border-slate-100 bg-aqua-fondo px-3 py-3">
              <Text className="text-[10px] font-bold text-slate-500">Estado</Text>
              <Text className="shrink text-sm font-black capitalize text-aqua-marino">{lectura.estadoMedidor}</Text>
            </View>
            <View className="min-w-[30%] flex-1 gap-1 rounded-2xl border border-slate-100 bg-aqua-fondo px-3 py-3">
              <Text className="text-[10px] font-bold text-slate-500">Lectura</Text>
              <Text className="shrink text-sm font-black text-aqua-marino">{lectura.lecturaActual ?? "No disponible"}</Text>
            </View>
            <View className="min-w-[30%] flex-1 gap-1 rounded-2xl border border-slate-100 bg-aqua-fondo px-3 py-3">
              <Text className="text-[10px] font-bold text-slate-500">Consumo</Text>
              <Text className="shrink text-sm font-black text-aqua-marino">{lectura.consumo === null ? "Pendiente" : `${lectura.consumo} m³`}</Text>
            </View>
          </View>
          {sonCoordenadasValidas(lectura.ubicacion) ? (
            <>
              <AquaButton
                titulo={mapaAbierto === lectura.idLocal ? "Ocultar ubicación" : "Ver ubicación guardada"}
                onPress={() =>
                  setMapaAbierto((actual) =>
                    actual === lectura.idLocal ? null : lectura.idLocal,
                  )
                }
                secundario
              />
              {mapaAbierto === lectura.idLocal && (
                <LeafletMap
                  coordenadas={lectura.ubicacion}
                  conectado={conectado}
                  altura={220}
                />
              )}
            </>
          ) : (
            <Text className="italic leading-5 text-slate-500">
              Esta lectura anterior no tiene una ubicación guardada.
            </Text>
          )}
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
      {mostrarExitoSync && (
        <SyncSuccessAnimation onDismiss={() => setMostrarExitoSync(false)} />
      )}
    </View>
  );
}
