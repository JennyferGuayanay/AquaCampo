import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { SymbolView } from "expo-symbols";
import { Redirect, router } from "expo-router";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInRight,
  FadeInUp,
  FadeOut,
  ReduceMotion,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { AnimatedTextField } from "../components/AnimatedTextField";
import { AquaButton } from "../components/AquaButton";
import { AquaMotionBackground } from "../components/AquaMotionBackground";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { UserAvatar } from "../components/UserAvatar";
import { auth } from "../config/firebase";
import { useAqua } from "../context/AquaContext";

function formatearFecha(fecha?: string) {
  if (!fecha) return "No disponible";
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? "No disponible"
    : valor.toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });
}

export default function EditarPerfil() {
  const {
    sesion,
    cargando,
    salir,
    fotoPerfilUri,
    guardarFotoPerfil,
    borrarFotoPerfil,
  } = useAqua();
  const usuario = auth.currentUser;
  const [nombre, setNombre] = useState(usuario?.displayName ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);
  const [menuFotoVisible, setMenuFotoVisible] = useState(false);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const escalaCamara = useSharedValue(1);
  const estiloCamara = useAnimatedStyle(() => ({
    transform: [{ scale: escalaCamara.get() }],
  }));

  const iniciales = (usuario?.displayName || usuario?.email || "AC")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  async function guardar() {
    const usuarioActual = auth.currentUser;

    if (!usuarioActual || !usuarioActual.emailVerified) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

    if (nombre.trim().length < 3) {
      Alert.alert("Nombre inválido", "Ingresa al menos 3 caracteres.");
      return;
    }

    setGuardando(true);
    setGuardado(false);

    try {
      await updateProfile(usuarioActual, { displayName: nombre.trim() });
      setGuardado(true);
      Alert.alert("Perfil actualizado", "Tu nombre se guardó correctamente.");
    } catch (error) {
      console.log("Error al actualizar perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre.");
    } finally {
      setGuardando(false);
    }
  }

  async function conservarSeleccion(resultado: ImagePicker.ImagePickerResult) {
    if (resultado.canceled) return;

    setProcesandoFoto(true);
    try {
      await guardarFotoPerfil(resultado.assets[0].uri);
    } catch (error) {
      console.log("Error al guardar foto de perfil:", error);
      Alert.alert("Error", "No se pudo guardar la foto seleccionada.");
    } finally {
      setProcesandoFoto(false);
    }
  }

  async function tomarFoto() {
    setMenuFotoVisible(false);
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso de cámara necesario",
        permiso.canAskAgain
          ? "Permite el acceso a la cámara para tomar tu foto de perfil."
          : "Activa el permiso de cámara para AquaCampo desde los ajustes del dispositivo.",
      );
      return;
    }

    try {
      await conservarSeleccion(
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
          cameraType: ImagePicker.CameraType.front,
        }),
      );
    } catch (error) {
      console.log("Error al abrir cámara de perfil:", error);
      Alert.alert("Cámara no disponible", "No se pudo abrir la cámara del dispositivo.");
    }
  }

  async function elegirDeGaleria() {
    setMenuFotoVisible(false);
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso de fotos necesario",
        permiso.canAskAgain
          ? "Permite el acceso a tus fotos para elegir una imagen de perfil."
          : "Activa el permiso de fotos para AquaCampo desde los ajustes del dispositivo.",
      );
      return;
    }

    try {
      await conservarSeleccion(
        await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        }),
      );
    } catch (error) {
      console.log("Error al abrir galería:", error);
      Alert.alert("Galería no disponible", "No se pudo abrir la galería del dispositivo.");
    }
  }

  function confirmarEliminarFoto() {
    setMenuFotoVisible(false);
    if (!fotoPerfilUri) return;

    Alert.alert("Eliminar foto", "Volverás a ver tus iniciales en AquaCampo.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setProcesandoFoto(true);
          void borrarFotoPerfil()
            .catch((error) => {
              console.log("Error al eliminar foto de perfil:", error);
              Alert.alert("Error", "No se pudo eliminar la foto de perfil.");
            })
            .finally(() => setProcesandoFoto(false));
        },
      },
    ]);
  }

  function animarCamara(valor: number) {
    escalaCamara.set(
      withSpring(valor, {
        damping: 13,
        stiffness: 300,
        mass: 0.4,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }

  async function copiarUid() {
    if (!usuario?.uid) return;
    await Clipboard.setStringAsync(usuario.uid);
    Alert.alert("UID copiado", "El identificador se copió al portapapeles.");
  }

  async function cambiarClave() {
    if (!usuario?.email) return;
    setEnviandoRecuperacion(true);
    try {
      await sendPasswordResetEmail(auth, usuario.email);
      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada para cambiar la contraseña de forma segura.",
      );
    } catch (error) {
      console.log("Error al enviar recuperación:", error);
      Alert.alert("Error", "No se pudo enviar el correo de recuperación.");
    } finally {
      setEnviandoRecuperacion(false);
    }
  }

  async function cerrarSesion() {
    try {
      await salir();
      router.replace("/login");
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  }

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-sky-50">
        <ActivityIndicator size="large" color="#087C98" />
      </View>
    );
  }

  if (!sesion || !usuario?.emailVerified || sesion !== usuario.uid) {
    return <Redirect href="/login" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-sky-50"
    >
      <AquaMotionBackground />
      <ScrollView
        contentContainerClassName="gap-5 p-5 pb-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInRight.duration(500)} className="items-center gap-3 overflow-hidden rounded-3xl bg-slate-900 p-6">
          <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-500/20" />
          <Animated.View entering={ZoomIn.delay(120).springify().damping(11)} className="relative">
            <UserAvatar uri={fotoPerfilUri} iniciales={iniciales} tamano="grande" />
            <Animated.View style={estiloCamara} className="absolute -bottom-1 -right-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cambiar foto de perfil"
                disabled={procesandoFoto}
                onPress={() => setMenuFotoVisible(true)}
                onPressIn={() => animarCamara(0.82)}
                onPressOut={() => animarCamara(1)}
                className="h-11 w-11 items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-200 shadow-lg"
              >
                {procesandoFoto ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  <SymbolView
                    name={{ ios: "camera.fill", android: "photo_camera", web: "photo_camera" }}
                    size={22}
                    tintColor="#0f172a"
                  />
                )}
              </Pressable>
            </Animated.View>
          </Animated.View>
          <View className="items-center">
            <Text className="text-xs font-black tracking-widest text-cyan-200">TÉCNICO AQUACAMPO</Text>
            <Text className="mt-1 text-center text-2xl font-black text-white">
              {usuario.displayName || "Usuario AquaCampo"}
            </Text>
            <Text className="mt-1 text-center text-sm text-cyan-100">{usuario.email}</Text>
            <View className="mt-3 rounded-full bg-emerald-400/15 px-3 py-2">
              <Text className="text-xs font-black text-emerald-200">Correo verificado</Text>
            </View>
          </View>
          <ConnectionStatus />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(450)} className="gap-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <View>
            <Text className="text-xl font-black text-slate-900">Editar nombre</Text>
            <Text className="mt-1 text-sm text-slate-500">Este nombre aparece en tu jornada de campo.</Text>
          </View>
          <AnimatedTextField
            placeholder="Tu nombre completo"
            value={nombre}
            onChangeText={(valor) => {
              setNombre(valor);
              setGuardado(false);
            }}
          />
          {guardado && (
            <Text className="rounded-xl bg-emerald-50 p-3 text-center font-bold text-emerald-700">
              Cambios guardados correctamente
            </Text>
          )}
          <AquaButton titulo="Guardar cambios" onPress={guardar} cargando={guardando} />
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(180).duration(420)} className="gap-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xl font-black text-slate-900">Información de cuenta</Text>
            <Text className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              {usuario.emailVerified ? "Verificado" : "No verificado"}
            </Text>
          </View>

          <View className="gap-1 rounded-2xl bg-slate-50 p-4">
            <Text className="text-xs font-bold text-slate-500">Correo electrónico</Text>
            <Text selectable className="font-bold text-slate-900">{usuario.email}</Text>
          </View>

          <View className="gap-2 rounded-2xl bg-slate-50 p-4">
            <Text className="text-xs font-bold text-slate-500">Identificador Firebase (UID)</Text>
            <Text selectable className="text-sm font-bold text-slate-900">{usuario.uid}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={copiarUid}
              className="self-start rounded-xl border border-teal-600 bg-cyan-50 px-4 py-2"
            >
              <Text className="font-extrabold text-teal-700">Copiar UID</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1 rounded-2xl bg-cyan-50 p-4">
              <Text className="text-xs font-bold text-slate-500">Cuenta creada</Text>
              <Text className="mt-1 text-sm font-extrabold text-slate-900">
                {formatearFecha(usuario.metadata.creationTime)}
              </Text>
            </View>
            <View className="min-w-0 flex-1 rounded-2xl bg-cyan-50 p-4">
              <Text className="text-xs font-bold text-slate-500">Último acceso</Text>
              <Text className="mt-1 text-sm font-extrabold text-slate-900">
                {formatearFecha(usuario.metadata.lastSignInTime)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(450)} className="gap-3 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <Text className="text-xl font-black text-slate-900">Seguridad</Text>
          <Text className="text-sm leading-5 text-slate-500">
            Recibirás un enlace de Firebase para cambiar tu contraseña sin exponerla en la aplicación.
          </Text>
          <AquaButton
            titulo="Enviar enlace para cambiar contraseña"
            onPress={cambiarClave}
            cargando={enviandoRecuperacion}
            secundario
          />
        </Animated.View>

        <AquaButton titulo="Regresar al inicio" onPress={() => router.replace("/medidores")} secundario />
        <AquaButton titulo="Cerrar sesión" onPress={cerrarSesion} peligro />
      </ScrollView>

      <Modal
        visible={menuFotoVisible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setMenuFotoVisible(false)}
      >
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(140)} className="flex-1 bg-slate-950/60">
          <Pressable className="flex-1 justify-end" onPress={() => setMenuFotoVisible(false)}>
            <Animated.View
              entering={FadeInUp.springify().damping(16)}
              className="rounded-t-4xl bg-white px-5 pb-8 pt-4"
              onTouchEnd={(evento) => evento.stopPropagation()}
            >
              <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-slate-300" />
              <Text className="text-2xl font-black text-slate-900">Foto de perfil</Text>
              <Text className="mb-5 mt-1 text-sm text-slate-500">
                Elige cómo quieres actualizar tu avatar local.
              </Text>

              <Pressable onPress={() => void tomarFoto()} className="mb-3 flex-row items-center gap-4 rounded-2xl bg-cyan-50 p-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-teal-700">
                  <SymbolView name={{ ios: "camera.fill", android: "photo_camera", web: "photo_camera" }} size={23} tintColor="#ffffff" />
                </View>
                <Text className="flex-1 text-base font-black text-slate-900">Tomar foto</Text>
              </Pressable>

              <Pressable onPress={() => void elegirDeGaleria()} className="mb-3 flex-row items-center gap-4 rounded-2xl bg-sky-50 p-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-sky-700">
                  <SymbolView name={{ ios: "photo.on.rectangle", android: "photo_library", web: "photo_library" }} size={23} tintColor="#ffffff" />
                </View>
                <Text className="flex-1 text-base font-black text-slate-900">Elegir de galería</Text>
              </Pressable>

              <Pressable
                disabled={!fotoPerfilUri}
                onPress={confirmarEliminarFoto}
                className={`mb-3 flex-row items-center gap-4 rounded-2xl bg-red-50 p-4 ${!fotoPerfilUri ? "opacity-40" : ""}`}
              >
                <View className="h-11 w-11 items-center justify-center rounded-full bg-red-700">
                  <SymbolView name={{ ios: "trash.fill", android: "delete", web: "delete" }} size={23} tintColor="#ffffff" />
                </View>
                <Text className="flex-1 text-base font-black text-red-800">Eliminar foto</Text>
              </Pressable>

              <Pressable onPress={() => setMenuFotoVisible(false)} className="min-h-14 items-center justify-center rounded-2xl border border-slate-200">
                <Text className="font-black text-slate-700">Cancelar</Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
