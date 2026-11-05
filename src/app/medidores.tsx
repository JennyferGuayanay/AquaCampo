
import { Redirect, router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
  ReduceMotion,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { auth } from "../config/firebase";
import { AnimatedProgressBar, AnimatedStatCard } from "../components/AnimatedMetrics";
import { AquaButton } from "../components/AquaButton";
import { AquaIllustration } from "../components/AquaIllustration";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { UserAvatar } from "../components/UserAvatar";
import { WaterMeterPhotoBackground } from "../components/WaterMeterPhotoBackground";
import { useAqua } from "../context/AquaContext";
import {
  borrarBorrador,
  obtenerBorrador,
} from "../storage/local";
import { validarCodigo } from "../utils/rules";

export default function Medidores() {
  const {
    sesion,
    cargando,
    lecturas,
    salir,
    fotoPerfilUri,
  } = useAqua();

  const [codigo, setCodigo] = useState("");
  const borradorRevisado = useRef(false);
  const escalaPerfil = useSharedValue(1);
  const estiloPerfil = useAnimatedStyle(() => ({
    transform: [{ scale: escalaPerfil.get() }],
  }));

  const usuario = auth.currentUser;

  const autorizado =
    !!sesion &&
    !!usuario &&
    usuario.emailVerified &&
    sesion === usuario.uid;

  const nombre =
    usuario?.displayName?.trim() || "Técnico";
  const iniciales = (usuario?.displayName || usuario?.email || "AC")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  const pendientes = lecturas.filter(
    (item) => item.estadoSync !== "enviado"
  ).length;

  const enviados = lecturas.filter(
    (item) => item.estadoSync === "enviado"
  ).length;

  const porcentajeEnviado = lecturas.length
    ? Math.round((enviados / lecturas.length) * 100)
    : 0;

  // Recuperar borradores de lecturas sin terminar.
  useEffect(() => {
    if (!autorizado || !sesion || borradorRevisado.current) {
      return;
    }

    borradorRevisado.current = true;

    obtenerBorrador(sesion)
      .then((borrador) => {
        if (!borrador) return;

        Alert.alert(
          "Registro sin terminar",
          "Encontramos un borrador de tu última jornada. Puedes continuarlo o descartarlo.",
          [
            {
              text: "Descartar",
              style: "destructive",
              onPress: () => {
                void borrarBorrador(sesion);
              },
            },
            {
              text: "Continuar",
              onPress: () =>
                router.push({
                  pathname: "/registro",
                  params: {
                    codigo: borrador.codigo,
                    idLocal: borrador.idLocal ?? undefined,
                    borrador: "1",
                  },
                }),
            },
          ]
        );
      })
      .catch((error) => {
        console.log("Error al recuperar borrador:", error);
      });
  }, [autorizado, sesion]);

  function consultar() {
    const normalizado = codigo.trim().toUpperCase();

    setCodigo(normalizado);

    if (!validarCodigo(normalizado)) {
      Alert.alert(
        "Código incorrecto",
        "Usa el formato MED- seguido de seis dígitos."
      );
      return;
    }

    router.push({
      pathname: "/detalle",
      params: { codigo: normalizado },
    });
  }

  async function cerrar() {
    try {
      await salir();
      router.replace("/login");
    } catch (error) {
      console.log("Error al cerrar sesión:", error);

      Alert.alert(
        "Error",
        "No se pudo cerrar la sesión."
      );
    }
  }

  function animarPerfil(valor: number) {
    escalaPerfil.set(
      withSpring(valor, {
        damping: 13,
        stiffness: 240,
        mass: 0.55,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-sky-50">
        <ActivityIndicator
          size="large"
          color="#0d9488"
        />
      </View>
    );
  }

  if (!autorizado) {
    return <Redirect href="/login" />;
  }

  return (
    <View className="flex-1 bg-sky-50">
      <WaterMeterPhotoBackground />
      <ScrollView
      className="flex-1 bg-transparent"
      contentContainerClassName="pb-10"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ENCABEZADO */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <View className="overflow-hidden bg-slate-900 px-6 pb-7 pt-12">
          <View className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-teal-500/20" />
          <View className="absolute -right-4 top-20 h-20 w-20 rounded-full bg-sky-400/10" />
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-teal-600">
              <Text className="text-2xl font-black text-white">A</Text>
            </View>
            <View>
              <Text className="text-xs font-extrabold tracking-widest text-cyan-200">
                JORNADA DE CAMPO
              </Text>
              <Text className="text-3xl font-black text-white">AquaCampo</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir Mi perfil"
            onPress={() => router.push("/editar-perfil")}
            className="mt-5 flex-row items-center gap-3"
          >
            <UserAvatar uri={fotoPerfilUri} iniciales={iniciales} />
            <View className="min-w-0 flex-1">
              <Text className="text-sm text-cyan-100">Bienvenido</Text>
              <Text className="text-xl font-black text-white" numberOfLines={1}>{nombre}</Text>
            </View>
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              size={22}
              tintColor="#a5f3fc"
            />
          </Pressable>

          <View className="mt-5">
            <ConnectionStatus />
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).springify().damping(15)}
        style={estiloPerfil}
        className="mx-4 mt-5"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mi perfil, cuenta, seguridad y datos personales"
          onPress={() => router.push("/editar-perfil")}
          onPressIn={() => animarPerfil(0.96)}
          onPressOut={() => animarPerfil(1)}
          className="min-h-24 flex-row items-center gap-4 overflow-hidden rounded-3xl bg-teal-700 p-4 shadow-lg"
        >
          <View className="absolute -right-5 -top-9 h-28 w-28 rounded-full bg-slate-900/25" />
          <View className="absolute -bottom-8 right-16 h-20 w-20 rounded-full bg-cyan-200/15" />
          <UserAvatar uri={fotoPerfilUri} iniciales={iniciales} tamano="tarjeta" />
          <View className="min-w-0 flex-1">
            <Text className="text-xl font-black text-white">Mi perfil</Text>
            <Text className="mt-1 text-sm leading-5 text-cyan-50">
              Cuenta, seguridad y datos personales
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-900/30">
            <SymbolView
              name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }}
              size={21}
              tintColor="#ffffff"
            />
          </View>
        </Pressable>
      </Animated.View>

      {/* CONSULTAR MEDIDOR */}
      <Animated.View entering={FadeInUp.delay(100).duration(500)}>
        <View className="mx-4 mt-5 rounded-2xl border border-cyan-100 bg-white/95 p-5">
          <Text className="text-xs font-extrabold tracking-widest text-teal-700">
            ACCIÓN PRINCIPAL
          </Text>

          <Text className="mt-2 text-2xl font-black text-slate-900">
            Identificar medidor
          </Text>

          <Text className="mb-5 mt-2 text-sm text-slate-500">
            Ingresa el código impreso en la etiqueta.
          </Text>

          <TextInput
            autoCapitalize="characters"
            maxLength={10}
            placeholder="MED-123456"
            placeholderTextColor="#94a3b8"
            className="mb-4 min-h-14 rounded-xl border border-slate-300 bg-slate-50 px-4 text-lg font-bold text-slate-900"
            value={codigo}
            onChangeText={setCodigo}
            onSubmitEditing={consultar}
          />

          <AquaButton
            titulo="Consultar medidor"
            onPress={consultar}
          />
        </View>
      </Animated.View>

      {/* ESTADÍSTICAS */}
      <Animated.View entering={ZoomIn.delay(180).duration(420)} className="mx-4 mt-5 flex-row gap-2">
        <AnimatedStatCard etiqueta="Lecturas" valor={lecturas.length} demora={180} />
        <AnimatedStatCard etiqueta="Pendientes" valor={pendientes} demora={280} />
        <AnimatedStatCard etiqueta="Enviadas" valor={enviados} demora={380} />
      </Animated.View>

      {/* AVANCE DE SINCRONIZACIÓN */}
      <View className="mx-4 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-5">
        <Text className="text-xs font-extrabold tracking-widest text-teal-700">
          SINCRONIZACIÓN
        </Text>

        <Text className="mt-2 text-xl font-black text-slate-900">
          Avance de lecturas
        </Text>

        <Text className="mt-2 text-sm text-slate-500">
          {enviados} de {lecturas.length} lecturas confirmadas
        </Text>

        <AnimatedProgressBar porcentaje={porcentajeEnviado} />

        <Text className="mt-3 text-right text-sm font-bold text-teal-700">
          {porcentajeEnviado}% confirmado
        </Text>
      </View>

      <Animated.View
        entering={FadeInUp.delay(220).duration(500)}
        className="mx-4 mt-5 overflow-hidden rounded-3xl border border-cyan-100 bg-cyan-50 px-4 pt-4"
      >
        <Text className="text-xs font-black tracking-widest text-teal-700">RED DE AGUA EN CAMPO</Text>
        <Text className="mt-1 text-lg font-black text-slate-900">
          Lecturas confiables, incluso sin conexión
        </Text>
        <AquaIllustration compacta />
      </Animated.View>

      {/* LECTURAS Y SINCRONIZACIÓN */}
      <View className="mx-4 mt-5">
        <AquaButton
          titulo="Ver lecturas y sincronización"
          onPress={() => router.push("/pendientes")}
          secundario
        />
      </View>

      {/* CERRAR SESIÓN */}
      <View className="mx-4 mt-4">
        <AquaButton
          titulo="Cerrar sesión"
          onPress={cerrar}
          peligro
        />
      </View>
      </ScrollView>
    </View>
  );
}
