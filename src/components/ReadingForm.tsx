import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AquaColores, AquaSombra } from "../constants/aquaTheme";
import { conservarFoto } from "../storage/photoStorage";
import type { Borrador, EstadoMedidor, Medidor } from "../types/models";
import { calcularConsumo, esAnomalo, validarRegistro } from "../utils/rules";
import { AquaButton } from "./AquaButton";

interface ReadingFormProps {
  medidor: Medidor | null;
  valor: Borrador;
  onChange(valor: Borrador): void;
  onGuardar(consumo: number | null, anomalo: boolean): void;
  guardando?: boolean;
}

export function ReadingForm({
  medidor,
  valor,
  onChange,
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
      <View style={estilos.camaraContenedor}>
        <CameraView
          ref={camara}
          facing="back"
          onCameraReady={() => setCamaraLista(true)}
          onMountError={() => setCamaraLista(false)}
          style={estilos.camara}
        />

        <Text style={estilos.ayudaCamara}>
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
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>Lectura de campo</Text>

      <Text style={estilos.descripcion}>
        Selecciona el estado observado antes de guardar.
      </Text>

      <View style={estilos.opciones}>
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
              style={[
                estilos.opcion,
                valor.estado === estado && estilos.opcionActiva,
              ]}
            >
              <Text
                style={[
                  estilos.textoOpcion,
                  valor.estado === estado && estilos.textoOpcionActiva,
                ]}
              >
                {estado}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {valor.estado !== "inaccesible" && (
        <TextInput
          style={estilos.input}
          placeholder="Lectura actual en m³"
          placeholderTextColor={AquaColores.textoSuave}
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
          style={estilos.input}
          placeholder="Motivo por el que no fue accesible"
          placeholderTextColor={AquaColores.textoSuave}
          value={valor.motivo}
          onChangeText={(motivo) => cambiar({ motivo })}
        />
      )}

      {valor.estado === "dañado" && (
        <TextInput
          style={[estilos.input, estilos.multilinea]}
          placeholder="Descripción del daño"
          placeholderTextColor={AquaColores.textoSuave}
          value={valor.descripcion}
          onChangeText={(descripcion) => cambiar({ descripcion })}
          multiline
        />
      )}

      {/* Mostrar consumo cuando existe lectura anterior */}
      {consumo !== null && (
        <View style={estilos.consumoCaja}>
          <Text style={estilos.consumoEtiqueta}>CONSUMO CALCULADO</Text>

          <Text style={estilos.consumo}>{consumo} m³</Text>
        </View>
      )}

      {/* R4: mostrar aviso cuando no existe lectura anterior */}
      {sinLecturaAnterior && valor.estado !== "inaccesible" && (
        <View style={estilos.advertencia}>
          <Text style={estilos.advertenciaTitulo}>
            Pendiente de verificación
          </Text>

          <Text style={estilos.descripcion}>
            Este medidor no tiene una lectura anterior registrada. La lectura
            actual se guardará, pero el consumo quedará pendiente de cálculo y
            verificación.
          </Text>
        </View>
      )}

      {/* R6: advertencia por consumo anomalo */}
      {anomalo && (
        <View style={estilos.advertencia}>
          <Text style={estilos.advertenciaTitulo}>Consumo fuera de rango</Text>

          <Text style={estilos.descripcion}>
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
            <Text style={estilos.confirmacion}>
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
        <Image source={{ uri: valor.fotoUri }} style={estilos.foto} />
      )}

      <AquaButton
        titulo="Guardar lectura"
        onPress={validarYGuardar}
        cargando={guardando}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: AquaColores.blanco,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    ...AquaSombra,
  },

  titulo: {
    color: AquaColores.marino,
    fontSize: 22,
    fontWeight: "900",
  },

  descripcion: {
    color: AquaColores.textoSuave,
    lineHeight: 20,
  },

  opciones: {
    flexDirection: "row",
    gap: 7,
  },

  opcion: {
    flex: 1,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: AquaColores.borde,
    borderRadius: 13,
    alignItems: "center",
  },

  opcionActiva: {
    backgroundColor: AquaColores.celeste,
    borderColor: AquaColores.turquesaOscuro,
  },

  textoOpcion: {
    color: AquaColores.textoSuave,
    textTransform: "capitalize",
  },

  textoOpcionActiva: {
    color: AquaColores.marino,
    fontWeight: "900",
  },

  input: {
    borderWidth: 1,
    borderColor: AquaColores.borde,
    backgroundColor: "#F8FCFD",
    borderRadius: 14,
    padding: 14,
    color: AquaColores.texto,
    fontSize: 16,
  },

  multilinea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  consumoCaja: {
    backgroundColor: AquaColores.marino,
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
  },

  consumoEtiqueta: {
    color: AquaColores.celeste,
    fontSize: 11,
    fontWeight: "800",
  },

  consumo: {
    color: AquaColores.blanco,
    fontSize: 28,
    fontWeight: "900",
  },

  advertencia: {
    backgroundColor: AquaColores.aviso,
    padding: 15,
    borderRadius: 16,
    gap: 8,
  },

  advertenciaTitulo: {
    color: "#764B00",
    fontWeight: "900",
    fontSize: 16,
  },

  confirmacion: {
    color: AquaColores.marino,
    fontWeight: "800",
  },

  foto: {
    width: "100%",
    height: 190,
    borderRadius: 16,
    resizeMode: "cover",
  },

  camaraContenedor: {
    gap: 12,
  },

  camara: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 22,
    overflow: "hidden",
  },

  ayudaCamara: {
    textAlign: "center",
    color: AquaColores.textoSuave,
  },
});
