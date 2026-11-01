import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { AquaButton } from "../components/AquaButton";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { MeterCard } from "../components/MeterCard";
import { ReadingForm } from "../components/ReadingForm";
import { useAqua } from "../context/AquaContext";
import { useMedidor } from "../hooks/useMedidor";
import {
  borrarBorrador,
  guardarBorrador,
  guardarLectura,
  obtenerBorrador,
  obtenerLecturas,
} from "../storage/local";
import type { Borrador, Lectura } from "../types/models";
import { validarCodigo } from "../utils/rules";

function borradorInicial(codigo: string, tecnico: string): Borrador {
  return {
    codigo,
    estado: "normal",
    lectura: "",
    motivo: "",
    descripcion: "",
    confirmado: false,
    fotoUri: null,
    tecnico,
    idLocal: null,
  };
}

export default function Registro() {
  const parametros = useLocalSearchParams<{
    codigo?: string;
    idLocal?: string;
    borrador?: string;
  }>();
  const codigo = typeof parametros.codigo === "string" ? parametros.codigo : "";
  const idLocal = typeof parametros.idLocal === "string" ? parametros.idLocal : null;
  const recuperar = parametros.borrador === "1";
  const { sesion, cargando, actualizar } = useAqua();
  const [codigoActual, setCodigoActual] = useState(codigo);
  const { medidor } = useMedidor(codigoActual);
  const [valor, setValor] = useState<Borrador | null>(null);
  const [lecturaAnterior, setLecturaAnterior] = useState<Lectura | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);
  const guardado = useRef(false);

  useEffect(() => {
    if (!sesion || !validarCodigo(codigo)) return;
    const tecnico = sesion;
    async function cargar() {
      const lecturas = await obtenerLecturas();
      const anterior = idLocal
        ? lecturas.find((item) => item.idLocal === idLocal) ?? null
        : null;
      setLecturaAnterior(anterior);

      if (anterior) {
        if (!["pendiente", "conflicto"].includes(anterior.estadoSync)) {
          Alert.alert("Lectura bloqueada", "Esta lectura ya no se puede editar.");
          router.replace("/pendientes");
          return;
        }
        setCodigoActual(anterior.codigoMedidor);
        setValor({
          codigo: anterior.codigoMedidor,
          estado: anterior.estadoMedidor,
          lectura: anterior.lecturaActual === null ? "" : String(anterior.lecturaActual),
          motivo: anterior.motivo,
          descripcion: anterior.descripcionDanio,
          confirmado: anterior.confirmacionAnomalia,
          fotoUri: anterior.fotoUri,
          tecnico,
          idLocal: anterior.idLocal,
        });
      } else if (recuperar) {
        setValor((await obtenerBorrador(tecnico)) ?? borradorInicial(codigo, tecnico));
      } else {
        setValor(borradorInicial(codigo, tecnico));
      }
      setListo(true);
    }
    void cargar();
  }, [codigo, idLocal, recuperar, sesion]);

  useEffect(() => {
    if (!sesion || !valor || !listo || guardado.current) return;
    const temporizador = setTimeout(() => {
      if (!guardado.current) void guardarBorrador(sesion, valor);
    }, 350);
    return () => clearTimeout(temporizador);
  }, [listo, sesion, valor]);

  if (cargando) {
    return <View className="flex-1 items-center justify-center bg-sky-50"><ActivityIndicator size="large" color="#087C98" /></View>;
  }
  if (!sesion) return <Redirect href="/login" />;

  if (!validarCodigo(codigo)) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-sky-50 p-6">
        <Text className="text-center text-2xl font-black text-slate-900">No se recibió un código de medidor válido.</Text>
        <AquaButton titulo="Volver al panel" onPress={() => router.replace("/medidores")} />
      </View>
    );
  }

  async function guardar(consumo: number | null, anomalo: boolean) {
    if (!valor || !sesion) return;
    if (!validarCodigo(codigoActual)) {
      Alert.alert("Código incorrecto", "Usa el formato MED- seguido de seis dígitos.");
      return;
    }
    const ahora = new Date();
    const mes = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
    const lectura: Lectura = {
      idLocal: lecturaAnterior?.idLocal ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      codigoMedidor: codigoActual,
      tecnico: sesion,
      fecha: lecturaAnterior?.fecha ?? ahora.toISOString(),
      mes: lecturaAnterior?.mes ?? mes,
      estadoMedidor: valor.estado,
      lecturaActual:
        valor.estado === "inaccesible" || !valor.lectura.trim()
          ? null
          : Number(valor.lectura),
      consumo: valor.estado === "inaccesible" ? null : consumo,
      motivo: valor.estado === "inaccesible" ? valor.motivo.trim() : "",
      descripcionDanio: valor.estado === "dañado" ? valor.descripcion.trim() : "",
      confirmacionAnomalia: anomalo ? valor.confirmado : false,
      fotoUri: valor.fotoUri,
      estadoSync: "pendiente",
      pendienteVerificacion: !medidor || medidor.ultimaLectura == null,
      conflicto: null,
    };

    setGuardando(true);
    guardado.current = true;
    try {
      await guardarLectura(lectura);
      await borrarBorrador(sesion);
      await actualizar();
      Alert.alert("Lectura guardada", "El registro quedó protegido en este dispositivo.");
      router.replace("/pendientes");
    } catch (error) {
      guardado.current = false;
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "Revisa los datos e intenta nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  }

  function descartar() {
    if (!sesion) return;
    const tecnico = sesion;
    Alert.alert(
      "Descartar borrador",
      "Se eliminarán únicamente los cambios no guardados de este formulario.",
      [
        { text: "Conservar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: async () => {
            guardado.current = true;
            await borrarBorrador(tecnico);
            router.replace("/medidores");
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-sky-50"
      contentContainerClassName="gap-4 p-5 pb-12"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(450)} className="gap-2">
        <Text className="text-xs font-black tracking-widest text-teal-700">CAPTURA EN CAMPO</Text>
        <Text className="text-3xl font-black text-slate-900">Registrar lectura</Text>
        <ConnectionStatus />
      </Animated.View>
      {medidor ? (
        <Animated.View entering={FadeInUp.delay(80).duration(450)}>
          <MeterCard medidor={medidor} />
        </Animated.View>
      ) : (
        <View className="gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-base font-black text-amber-900">Pendiente de verificación</Text>
          <Text className="leading-5 text-amber-900">
            No hay datos previos disponibles. Al reconectar se validará el medidor y se revisará el consumo.
          </Text>
        </View>
      )}
      {lecturaAnterior?.conflicto?.tipo === "medidor_no_encontrado" && (
        <View className="gap-3 rounded-2xl border border-cyan-100 bg-white p-4">
          <Text className="text-base font-black text-amber-900">Corregir código del medidor</Text>
          <Text className="leading-5 text-slate-600">
            El código anterior no existe en MockAPI. Ingresa el código correcto antes de guardar.
          </Text>
          <TextInput
            autoCapitalize="characters"
            maxLength={10}
            placeholder="MED-123456"
            placeholderTextColor="#688391"
            className="rounded-2xl border border-cyan-100 bg-slate-50 p-4 font-black tracking-widest text-slate-900"
            value={codigoActual}
            onChangeText={(nuevoCodigo) => {
              const normalizado = nuevoCodigo.toUpperCase();
              setCodigoActual(normalizado);
              setValor((actual) => actual ? { ...actual, codigo: normalizado } : actual);
            }}
          />
        </View>
      )}
      {valor && (
        <ReadingForm
          medidor={medidor}
          valor={valor}
          onChange={setValor}
          onGuardar={guardar}
          guardando={guardando}
        />
      )}
      <AquaButton titulo="Descartar borrador y salir" onPress={descartar} secundario />
    </ScrollView>
  );
}
