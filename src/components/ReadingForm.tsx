import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { conservarFoto } from "../storage/photoStorage";
import type { Borrador, Coordenadas, EstadoMedidor, Medidor } from "../types/models";
import {
  calcularConsumo,
  esAnomalo,
  sonCoordenadasValidas,
  validarRegistro,
} from "../utils/rules";
import { AquaButton } from "./AquaButton";
import { LeafletMap } from "./LeafletMap";

interface ReadingFormProps {
  medidor: Medidor | null;
  valor: Borrador;
  conectado: boolean;
  estadoUbicacion: "inactivo" | "cargando" | "denegado" | "error" | "disponible" | "manual";
  onChange(valor: Borrador): void;
  onCambiarUbicacion(ubicacion: Coordenadas): void;
  onSolicitarUbicacion(): void;
  onGuardar(consumo: number | null, anomalo: boolean): void;
  guardando?: boolean;
}

export function ReadingForm({
  medidor,
  valor,
  conectado,
  estadoUbicacion,
  onChange,
  onCambiarUbicacion,
  onSolicitarUbicacion,
  onGuardar,
  guardando = false,
}: ReadingFormProps) {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const camara = useRef<CameraView>(null);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);
  const [capturando, setCapturando] = useState(false);

  // Validar que la lectura sea un numero entero valido.
  const lecturaValida =
    /^\d+$/.test(valor.lectura.trim()) &&
    Number.isSafeInteger(Number(valor.lectura));

  // R4: no calcular consumo si no existe lectura anterior.
  // Es importante no convertir null a 0.
  const consumo =
    medidor &&
    medidor.ultimaLectura != null &&
    lecturaValida &&
    valor.estado !== "inaccesible"
      ? calcularConsumo(Number(valor.lectura), Number(medidor.ultimaLectura))
      : null;

  // R6: detectar consumos fuera de rango.
  const anomalo =
    consumo !== null && medidor
      ? esAnomalo(consumo, Number(medidor.promedioMensual))
      : false;

  // R4: identificar medidores sin lectura anterior.
  const sinLecturaAnterior = medidor !== null && medidor.ultimaLectura == null;

  function cambiar(cambio: Partial<Borrador>) {
    onChange({ ...valor, ...cambio });
  }

  async function abrirCamara() {
    if (!permiso?.granted) {
      const respuesta = await solicitarPermiso();

      if (!respuesta.granted) {
        Alert.alert(
          "Permiso de cámara",
          "AquaCampo necesita la cámara para documentar daños y consumos anómalos.",
        );
        return;
      }
    }

    setCamaraLista(false);
    setMostrarCamara(true);
  }

  async function capturar() {
    if (!camaraLista || capturando) return;

    setCapturando(true);

    try {
      const foto = await camara.current?.takePictureAsync({
        quality: 0.65,
      });

      if (!foto?.uri) {
        throw new Error("La cámara no devolvió una fotografía.");
      }

      const uriPersistente = await conservarFoto(foto.uri);

      cambiar({ fotoUri: uriPersistente });
      setMostrarCamara(false);
    } catch {
      Alert.alert(
        "Fotografía",
        "No se pudo capturar y conservar la fotografía.",
      );
    } finally {
      setCapturando(false);
    }
  }

  function validarYGuardar() {
    if (!sonCoordenadasValidas(valor.ubicacion)) {
      return Alert.alert(
        "Ubicación obligatoria",
        "Obtén tu ubicación actual o selecciona un punto válido en el mapa.",
      );
    }

    const error = validarRegistro(
      valor.estado,
      valor.estado === "inaccesible" ? "" : valor.lectura,
      valor.motivo,
      valor.descripcion,
    );

    if (error) {
      return Alert.alert("Validación", error);
    }

    if (consumo !== null && consumo < 0) {
      return Alert.alert(
        "Lectura inválida",
        "La lectura actual no puede ser menor que la anterior.",
      );
    }

    if (anomalo && !valor.confirmado) {
      return Alert.alert(
        "Revisión requerida",
        "Confirma que revisaste el medidor.",
      );
    }

    if ((valor.estado === "dañado" || anomalo) && !valor.fotoUri) {
      return Alert.alert(
        "Foto obligatoria",
        "Toma una fotografía del medidor.",
      );
    }

    onGuardar(consumo, anomalo);
  }

  if (mostrarCamara) {
    return (
      <View className="gap-3">
        <CameraView
          ref={camara}
          facing="back"
          onCameraReady={() => setCamaraLista(true)}
          onMountError={() => setCamaraLista(false)}
          style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 22, overflow: "hidden" }}
        />

        <Text className="text-center text-slate-500">
          {camaraLista ? "Centra el medidor y captura" : "Preparando cámara..."}
        </Text>

        <AquaButton
          titulo="Capturar fotografía"
          onPress={capturar}
          deshabilitado={!camaraLista}
          cargando={capturando}
        />

        <AquaButton
          titulo="Cancelar"
          onPress={() => setMostrarCamara(false)}
          secundario
        />
      </View>
    );
  }

  return (
    <View className="gap-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
      <Text className="text-2xl font-black text-slate-900">Lectura de campo</Text>

      <Text className="leading-5 text-slate-500">
        Selecciona el estado observado antes de guardar.
      </Text>

      <Text className="text-base font-black text-slate-900">Ubicación del medidor</Text>
      <LeafletMap
        coordenadas={valor.ubicacion ?? null}
        editable
        conectado={conectado}
        onCambiarCoordenadas={onCambiarUbicacion}
      />
      {estadoUbicacion === "cargando" && (
        <Text className="leading-5 text-slate-500">Obteniendo ubicación GPS...</Text>
      )}
      {estadoUbicacion === "denegado" && (
        <Text className="rounded-2xl border border-amber-200 bg-amber-50 p-3 leading-5 text-amber-900">
          No se concedió el permiso GPS. Puedes colocar el marcador manualmente
          en el mapa.
        </Text>
      )}
      {estadoUbicacion === "error" && (
        <Text className="rounded-2xl border border-amber-200 bg-amber-50 p-3 leading-5 text-amber-900">
          No se pudo obtener el GPS. Selecciona la ubicación manualmente en el
          mapa.
        </Text>
      )}
      {(estadoUbicacion === "denegado" || estadoUbicacion === "error") && (
        <AquaButton
          titulo="Intentar obtener GPS de nuevo"
          onPress={onSolicitarUbicacion}
          secundario
        />
      )}

      <View className="flex-row gap-2">
        {(["normal", "inaccesible", "dañado"] as EstadoMedidor[]).map(
          (estado) => (
            <TouchableOpacity
              key={estado}
              onPress={() =>
                cambiar({
                  estado,
                  confirmado: false,
                })
              }
              className={`flex-1 items-center rounded-xl border py-3 ${
                valor.estado === estado
                  ? "border-teal-700 bg-cyan-100"
                  : "border-cyan-100 bg-white"
              }`}
            >
              <Text
                className={`capitalize ${
                  valor.estado === estado
                    ? "font-black text-slate-900"
                    : "text-slate-500"
                }`}
              >
                {estado}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {valor.estado !== "inaccesible" && (
        <TextInput
          className="rounded-2xl border border-cyan-100 bg-slate-50 p-4 text-base text-slate-800"
          placeholder="Lectura actual en m³"
          placeholderTextColor="#688391"
          keyboardType="numeric"
          value={valor.lectura}
          onChangeText={(lectura) =>
            cambiar({
              lectura,
              confirmado: false,
            })
          }
        />
      )}

      {valor.estado === "inaccesible" && (
        <TextInput
          className="rounded-2xl border border-cyan-100 bg-slate-50 p-4 text-base text-slate-800"
          placeholder="Motivo por el que no fue accesible"
          placeholderTextColor="#688391"
          value={valor.motivo}
          onChangeText={(motivo) => cambiar({ motivo })}
        />
      )}

      {valor.estado === "dañado" && (
        <TextInput
          className="min-h-24 rounded-2xl border border-cyan-100 bg-slate-50 p-4 text-base text-slate-800"
          placeholder="Descripción del daño"
          placeholderTextColor="#688391"
          value={valor.descripcion}
          onChangeText={(descripcion) => cambiar({ descripcion })}
          multiline
        />
      )}

      {/* Mostrar consumo cuando existe lectura anterior */}
      {consumo !== null && (
        <View className="items-center rounded-2xl bg-slate-900 p-4">
          <Text className="text-[11px] font-extrabold tracking-widest text-cyan-200">
            CONSUMO CALCULADO
          </Text>

          <Text className="text-3xl font-black text-white">{consumo} m³</Text>
        </View>
      )}

      {/* R4: mostrar aviso cuando no existe lectura anterior */}
      {sinLecturaAnterior && valor.estado !== "inaccesible" && (
        <View className="gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-base font-black text-amber-900">
            Pendiente de verificación
          </Text>

          <Text className="leading-5 text-amber-900">
            Este medidor no tiene una lectura anterior registrada. La lectura
            actual se guardará, pero el consumo quedará pendiente de cálculo y
            verificación.
          </Text>
        </View>
      )}

      {/* R6: advertencia por consumo anomalo */}
      {anomalo && (
        <View className="gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-base font-black text-amber-900">Consumo fuera de rango</Text>

          <Text className="leading-5 text-amber-900">
            Supera tres veces el promedio mensual. Revisa el medidor y documenta
            la evidencia.
          </Text>

          <TouchableOpacity
            onPress={() =>
              cambiar({
                confirmado: !valor.confirmado,
              })
            }
          >
            <Text className="font-extrabold text-slate-900">
              {valor.confirmado ? "☑" : "☐"} Confirmo que revisé el medidor
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <AquaButton
        titulo={valor.fotoUri ? "Cambiar fotografía" : "Tomar fotografía"}
        onPress={abrirCamara}
        secundario
      />

      {valor.fotoUri && (
        <Image
          source={{ uri: valor.fotoUri }}
          className="h-48 w-full rounded-2xl"
          resizeMode="cover"
        />
      )}

      <AquaButton
        titulo="Guardar lectura"
        onPress={validarYGuardar}
        cargando={guardando}
      />
    </View>
  );
}
