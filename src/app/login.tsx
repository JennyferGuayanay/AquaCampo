
import { Redirect, router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { auth } from "../config/firebase";
import { useAqua } from "../context/AquaContext";

export default function Login() {
  const { sesion, cargando, entrar } = useAqua();

  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);

  const desplazamiento = useRef(makeMutable(0));

  const estiloShake = useAnimatedStyle(() => ({
    transform: [
      { translateX: desplazamiento.current.value },
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
    <ScrollView
      className="flex-1 bg-sky-50"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text className="mb-8 text-center text-4xl font-bold text-teal-700">
          AquaCampo
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500)}>
        <Animated.View style={estiloShake}>
          <View className="rounded-2xl bg-white p-6">
            <Text className="mb-5 text-2xl font-bold">
              Iniciar sesión
            </Text>

            <Text className="mb-2 font-semibold">
              Correo electrónico
            </Text>

            <TextInput
              className="mb-5 rounded-xl border border-slate-300 p-3"
              placeholder="correo@ejemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={correo}
              onChangeText={setCorreo}
            />

            <Text className="mb-2 font-semibold">
              Contraseña
            </Text>

            <TextInput
              className="mb-6 rounded-xl border border-slate-300 p-3"
              placeholder="Contraseña"
              secureTextEntry
              value={clave}
              onChangeText={setClave}
              onSubmitEditing={ingresar}
            />

            <Pressable
              onPress={ingresar}
              disabled={enviando}
              className="items-center rounded-xl bg-teal-600 p-4"
            >
              {enviando ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-bold text-white">
                  Ingresar
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/recuperar-clave")}
              className="mt-5 items-center"
            >
              <Text className="text-teal-700">
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/crear-cuenta")}
              className="mt-5 items-center"
            >
              <Text className="font-bold text-teal-700">
                Crear cuenta
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}