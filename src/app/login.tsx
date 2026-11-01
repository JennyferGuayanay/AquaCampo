
import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  reload,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Animated, {
  FadeInDown,
  FadeInUp,
  makeMutable,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AnimatedTextField } from "../components/AnimatedTextField";
import { AquaButton } from "../components/AquaButton";
import { AquaDropLogo } from "../components/AquaDropLogo";
import { AquaIllustration } from "../components/AquaIllustration";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { WaterMeterPhotoBackground } from "../components/WaterMeterPhotoBackground";
import { auth } from "../config/firebase";
import { useAqua } from "../context/AquaContext";

export default function Login() {
  const { sesion, cargando, entrar } = useAqua();

  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);

  const desplazamiento = useRef(makeMutable(0));
  const reducirMovimiento = useReducedMotion();
  const entradaFormulario = useSharedValue(reducirMovimiento ? 1 : 0);

  useEffect(() => {
    if (reducirMovimiento) return;
    entradaFormulario.set(
      withSpring(1, {
        damping: 12,
        stiffness: 115,
        mass: 0.8,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [entradaFormulario, reducirMovimiento]);

  const estiloShake = useAnimatedStyle(() => ({
    transform: [
      { translateX: desplazamiento.current.value },
    ],
  }));

  const estiloEntrada = useAnimatedStyle(() => ({
    opacity: entradaFormulario.get(),
    transform: [
      { translateY: (1 - entradaFormulario.get()) * 70 },
      { scale: 0.86 + entradaFormulario.get() * 0.14 },
    ],
  }));

  function shake() {
    desplazamiento.current.value = withSequence(
      withTiming(-14, { duration: 60 }),
      withTiming(14, { duration: 60 }),
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-5, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  }

  async function ingresar() {
    if (!correo.trim() || !clave.trim()) {
      shake();
      Alert.alert(
        "Campos obligatorios",
        "Ingresa correo y contraseña."
      );
      return;
    }

    setEnviando(true);

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        correo.trim().toLowerCase(),
        clave
      );

      await reload(credencial.user);

      if (!credencial.user.emailVerified) {
        router.replace("/verificar-correo");
        return;
      }

      await entrar(credencial.user.uid);
      router.replace("/bienvenido");
    } catch (error) {
      shake();

      console.log("Error de login:", error);

      Alert.alert(
        "Credenciales incorrectas",
        "Revisa tu correo electrónico y contraseña."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-sky-50">
        <ActivityIndicator color="#0d9488" size="large" />
      </View>
    );
  }

  if (sesion) {
    return <Redirect href="/bienvenido" />;
  }

  return (
    <View className="flex-1 bg-slate-950">
      <WaterMeterPhotoBackground intenso />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(650)} className="items-center">
            <AquaDropLogo />
            <Text className="mt-1 text-center text-4xl font-black text-white">AquaCampo</Text>
            <Text className="mt-2 text-center font-semibold text-cyan-100">
              Agua, tecnología y trabajo de campo
            </Text>
            <View className="mt-4">
              <ConnectionStatus soloConexion />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(100).duration(600)}
            className="my-2 overflow-hidden rounded-3xl border border-white/30 bg-white/80 px-3"
          >
            <AquaIllustration compacta />
          </Animated.View>

          <Animated.View style={estiloEntrada}>
            <Animated.View style={estiloShake}>
              <View className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-lg">
                <Text className="mb-1 text-2xl font-black text-slate-900">Iniciar sesión</Text>
                <Text className="mb-5 text-sm text-slate-500">
                  Accede a tus medidores y lecturas sincronizadas.
                </Text>

                <Text className="mb-2 font-semibold text-slate-700">Correo electrónico</Text>
                <AnimatedTextField
                  containerClassName="mb-5"
                  placeholder="correo@ejemplo.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={correo}
                  onChangeText={setCorreo}
                />

                <Text className="mb-2 font-semibold text-slate-700">Contraseña</Text>
                <AnimatedTextField
                  containerClassName="mb-6"
                  placeholder="Contraseña"
                  secureTextEntry
                  value={clave}
                  onChangeText={setClave}
                  onSubmitEditing={ingresar}
                />

                <AquaButton titulo="Ingresar" onPress={ingresar} cargando={enviando} />

                <Pressable
                  onPress={() => router.push("/recuperar-clave")}
                  className="mt-5 items-center"
                >
                  <Text className="font-semibold text-teal-700">¿Olvidaste tu contraseña?</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/crear-cuenta")}
                  className="mt-5 items-center"
                >
                  <Text className="font-black text-teal-700">Crear cuenta</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>

          <Text className="mt-5 text-center text-[10px] text-cyan-100/80">
            Fotografía: Basile Morin · CC BY-SA 4.0
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
