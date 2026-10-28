import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useConnectivity } from "../hooks/useConnectivity";
import { obtenerMedidor } from "../services/api";
import { sincronizarLecturas } from "../services/sync";
import {
  borrarBorrador,
  cerrarSesion,
  guardarBorrador,
  guardarLectura,
  guardarMedidor,
  guardarSesion,
  obtenerBorrador,
  obtenerLecturas,
  obtenerMedidores,
  obtenerSesion,
} from "../storage/local";
import { conservarFoto } from "../storage/photoStorage";
import type {
  Borrador,
  EstadoMedidor,
  Lectura,
  Medidor,
} from "../types/models";
import {
  calcularConsumo,
  esAnomalo,
  validarCodigo,
  validarRegistro,
} from "../utils/rules";

type Pantalla = "inicio" | "buscar" | "registro" | "pendientes";

export default function Inicio() {
  const conectado = useConnectivity();
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const camara = useRef<CameraView>(null);

  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<string | null>(null);
  const [empleado, setEmpleado] = useState("");
  const [clave, setClave] = useState("");
  const [pantalla, setPantalla] = useState<Pantalla>("inicio");

  const [codigo, setCodigo] = useState("");
  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [estado, setEstado] = useState<EstadoMedidor>("normal");
  const [lectura, setLectura] = useState("");
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [mostrarCamara, setMostrarCamara] = useState(false);

  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [listo, setListo] = useState(false);

  const actualizar = useCallback(async () => {
    const datos = await obtenerLecturas();
    setLecturas(datos);
  }, []);

  const sincronizar = useCallback(
    async (mostrarMensaje = false) => {
      if (!conectado) {
        if (mostrarMensaje) {
          Alert.alert(
            "Sin conexión",
            "Las lecturas se conservarán hasta recuperar internet.",
          );
        }
        return;
      }

      setSincronizando(true);

      try {
        const resultado = await sincronizarLecturas();
        await actualizar();

        if (mostrarMensaje) {
          Alert.alert(
            "Resultado de sincronización",
            `Enviados o confirmados: ${resultado.enviados}\n` +
              `Requieren verificación: ${resultado.verificacion}\n` +
              `Conflictos: ${resultado.conflictos}\n` +
              `Errores de red: ${resultado.errores}`,
          );
        }
      } catch {
        if (mostrarMensaje) {
          Alert.alert(
            "Error de sincronización",
            "No se pudo completar. Las lecturas siguen guardadas.",
          );
        }
      } finally {
        await actualizar();
        setSincronizando(false);
      }
    },
    [conectado, actualizar],
  );

  // Recuperar los campos y los datos del medidor.
  async function recuperarBorrador(borrador: Borrador) {
    const cache = await obtenerMedidores();

    setCodigo(borrador.codigo);
    setMedidor(cache[borrador.codigo] ?? null);
    setEstado(borrador.estado);
    setLectura(borrador.lectura);
    setMotivo(borrador.motivo);
    setDescripcion(borrador.descripcion);
    setConfirmado(borrador.confirmado);
    setFotoUri(borrador.fotoUri);
    setEditando(null);
    setPantalla("registro");
  }

  useEffect(() => {
    async function iniciar() {
      try {
        const usuario = await obtenerSesion();
        setSesion(usuario);
        await actualizar();

        const borrador = await obtenerBorrador();

        if (usuario && borrador) {
          Alert.alert(
            "Registro incompleto",
            "Encontramos un registro sin terminar. ¿Deseas continuarlo?",
            [
              {
                text: "Descartar",
                style: "destructive",
                onPress: async () => {
                  await borrarBorrador();
                  setListo(true);
                },
              },
              {
                text: "Continuar",
                onPress: async () => {
                  await recuperarBorrador(borrador);
                  setListo(true);
                },
              },
            ],
          );
        } else {
          setListo(true);
        }
      } catch {
        Alert.alert(
          "Error",
          "No se pudieron recuperar todos los datos locales.",
        );
        setListo(true);
      } finally {
        setCargando(false);
      }
    }

    iniciar();
  }, [actualizar]);

  // Guardar automáticamente los cambios del formulario.
  useEffect(() => {
    if (!sesion || !listo || pantalla !== "registro") return;

    const borrador: Borrador = {
      codigo,
      estado,
      lectura,
      motivo,
      descripcion,
      confirmado,
      fotoUri,
    };

    guardarBorrador(borrador).catch(() => {});
  }, [
    sesion,
    listo,
    pantalla,
    codigo,
    estado,
    lectura,
    motivo,
    descripcion,
    confirmado,
    fotoUri,
  ]);

  // Sincronizar al recuperar la conexión y mientras está abierta.
  useEffect(() => {
    if (!conectado || !sesion) return;

    sincronizar();

    const intervalo = setInterval(() => {
      sincronizar();
    }, 12000);

    const sub = AppState.addEventListener("change", (valor) => {
      if (valor === "active") {
        sincronizar();
      }
    });

    return () => {
      clearInterval(intervalo);
      sub.remove();
    };
  }, [conectado, sesion, sincronizar]);

  async function entrar() {
    if (empleado.trim().toUpperCase() !== "TEC001" || clave !== "123456") {
      Alert.alert("Acceso denegado", "Código o contraseña incorrectos.");
      return;
    }

    await guardarSesion("TEC001");
    setSesion("TEC001");
    setPantalla("inicio");
  }

  async function salir() {
    await cerrarSesion();
    setSesion(null);
    setPantalla("inicio");
  }

  function limpiar() {
    setCodigo("");
    setMedidor(null);
    setEstado("normal");
    setLectura("");
    setMotivo("");
    setDescripcion("");
    setConfirmado(false);
    setFotoUri(null);
    setEditando(null);
  }

  async function buscar() {
    const valor = codigo.trim().toUpperCase();
    setCodigo(valor);

    if (!validarCodigo(valor)) {
      Alert.alert("Código incorrecto", "El formato obligatorio es MED-123456.");
      return;
    }

    setBuscando(true);

    try {
      const cache = await obtenerMedidores();

      if (cache[valor]) {
        setMedidor(cache[valor]);
        setPantalla("registro");
        return;
      }

      if (!conectado) {
        setMedidor(null);
        setPantalla("registro");
        return;
      }

      const encontrado = await obtenerMedidor(valor);

      if (!encontrado) {
        Alert.alert(
          "Medidor no encontrado",
          "No existe un medidor con ese código.",
        );
        return;
      }

      await guardarMedidor(encontrado);
      setMedidor(encontrado);
      setPantalla("registro");
    } catch {
      setMedidor(null);
      Alert.alert(
        "Consulta no disponible",
        "Puedes registrar una lectura pendiente de verificación.",
      );
      setPantalla("registro");
    } finally {
      setBuscando(false);
    }
  }

  async function tomarFoto() {
    if (!permiso?.granted) {
      const respuesta = await solicitarPermiso();

      if (!respuesta.granted) {
        Alert.alert(
          "Permiso de cámara",
          "No se concedió acceso a la cámara. La fotografía es obligatoria para medidores dañados y anomalías.",
        );
        return;
      }
    }

    setMostrarCamara(true);
  }

  async function capturar() {
    try {
      const resultado = await camara.current?.takePictureAsync({
        quality: 0.65,
      });

      if (!resultado?.uri) {
        Alert.alert("Cámara", "No se pudo capturar la imagen.");
        return;
      }

      const ruta = await conservarFoto(resultado.uri);
      setFotoUri(ruta);
      setMostrarCamara(false);
    } catch {
      Alert.alert("Error de cámara", "No se pudo conservar la fotografía.");
    }
  }

  const lecturaValida =
    /^\d+$/.test(lectura.trim()) && Number.isSafeInteger(Number(lectura));

  const consumo =
    medidor && lecturaValida && estado !== "inaccesible"
      ? calcularConsumo(Number(lectura), Number(medidor.ultimaLectura))
      : null;

  const anomalo =
    consumo !== null && medidor
      ? esAnomalo(consumo, Number(medidor.promedioMensual))
      : false;

  async function guardar() {
    if (!sesion || !validarCodigo(codigo)) {
      Alert.alert("Error", "El código del medidor es inválido.");
      return;
    }

    const error = validarRegistro(
      estado,
      estado === "inaccesible" ? "" : lectura,
      motivo,
      descripcion,
    );

    if (error) {
      Alert.alert("Validación", error);
      return;
    }

    if (consumo !== null && consumo < 0) {
      Alert.alert(
        "Lectura inválida",
        "La lectura actual no puede ser menor que la anterior.",
      );
      return;
    }

    if (anomalo && !confirmado) {
      Alert.alert("Advertencia", "Confirma que revisaste el medidor.");
      return;
    }

    if ((estado === "dañado" || anomalo) && !fotoUri) {
      Alert.alert("Foto obligatoria", "Toma una fotografía del medidor.");
      return;
    }

    const ahora = new Date();
    const mes =
      `${ahora.getFullYear()}-` + String(ahora.getMonth() + 1).padStart(2, "0");

    const anterior = lecturas.find((item) => item.idLocal === editando);

    const registro: Lectura = {
      idLocal:
        anterior?.idLocal ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      codigoMedidor: codigo,
      tecnico: sesion,
      fecha: anterior?.fecha ?? ahora.toISOString(),
      mes: anterior?.mes ?? mes,
      estadoMedidor: estado,
      lecturaActual:
        estado === "inaccesible" || !lectura.trim() ? null : Number(lectura),
      consumo: estado === "inaccesible" ? null : consumo,
      motivo: estado === "inaccesible" ? motivo : "",
      descripcionDanio: estado === "dañado" ? descripcion : "",
      confirmacionAnomalia: anomalo ? confirmado : false,
      fotoUri,
      estadoSync: "pendiente",
      pendienteVerificacion: !medidor,
    };

    try {
      await guardarLectura(registro);
      await borrarBorrador();
      await actualizar();

      limpiar();
      setPantalla("pendientes");

      Alert.alert("Guardado", "La lectura quedó conservada en el teléfono.");

      if (conectado) {
        await sincronizar();
      }
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "No se pudo guardar.",
      );
    }
  }

  async function editar(item: Lectura) {
    if (item.estadoSync === "enviado") {
      Alert.alert(
        "Lectura bloqueada",
        "Los registros enviados no se pueden editar.",
      );
      return;
    }

    const cache = await obtenerMedidores();

    setMedidor(cache[item.codigoMedidor] ?? null);
    setCodigo(item.codigoMedidor);
    setEstado(item.estadoMedidor);
    setLectura(item.lecturaActual === null ? "" : String(item.lecturaActual));
    setMotivo(item.motivo);
    setDescripcion(item.descripcionDanio);
    setConfirmado(item.confirmacionAnomalia);
    setFotoUri(item.fotoUri);
    setEditando(item.idLocal);
    setPantalla("registro");
  }

  function Boton({
    titulo,
    onPress,
    secundario = false,
  }: {
    titulo: string;
    onPress: () => void;
    secundario?: boolean;
  }) {
    return (
      <TouchableOpacity
        style={[s.boton, secundario && s.botonSecundario]}
        onPress={onPress}
      >
        <Text style={[s.textoBoton, secundario && s.textoSecundario]}>
          {titulo}
        </Text>
      </TouchableOpacity>
    );
  }

  if (cargando) {
    return (
      <View style={s.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!sesion) {
    return (
      <View style={s.login}>
        <Text style={s.marca}>💧 AquaCampo</Text>
        <Text style={s.descripcion}>Gestión de lecturas de agua</Text>

        <View style={s.tarjeta}>
          <Text style={s.titulo}>Acceso del técnico</Text>

          <TextInput
            style={s.input}
            placeholder="Código de empleado"
            value={empleado}
            onChangeText={setEmpleado}
            autoCapitalize="characters"
          />

          <TextInput
            style={s.input}
            placeholder="Contraseña"
            value={clave}
            onChangeText={setClave}
            secureTextEntry
          />

          <Boton titulo="Iniciar sesión" onPress={entrar} />
        </View>
      </View>
    );
  }

  const pendientes = lecturas.filter(
    (item) => item.estadoSync !== "enviado",
  ).length;

  return (
    <View style={s.fondo}>
      <View style={s.cabecera}>
        <Text style={s.marca}>💧 AquaCampo</Text>
        <Text style={s.cabeceraTexto}>
          {conectado ? "● Con conexión" : "● Sin conexión"}
          {"   "}Pendientes: {pendientes}
        </Text>
        <Text style={s.cabeceraTexto}>Técnico: {sesion}</Text>
      </View>

      {mostrarCamara ? (
        <View style={{ flex: 1 }}>
          <CameraView ref={camara} style={{ flex: 1 }} facing="back" />

          <View style={{ padding: 15 }}>
            <Boton titulo="📷 Capturar fotografía" onPress={capturar} />
            <Boton
              titulo="Cancelar"
              secundario
              onPress={() => setMostrarCamara(false)}
            />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.contenido}>
          {pantalla === "inicio" && (
            <View style={s.tarjeta}>
              <Text style={s.titulo}>Panel de campo</Text>

              <Text style={s.descripcion}>
                Lecturas registradas: {lecturas.length}
              </Text>

              <Text style={s.descripcion}>
                Pendientes por enviar: {pendientes}
              </Text>

              <Boton
                titulo="Consultar medidor"
                onPress={() => {
                  limpiar();
                  setPantalla("buscar");
                }}
              />

              <Boton
                titulo="Ver lecturas"
                onPress={() => setPantalla("pendientes")}
              />

              <Boton titulo="Cerrar sesión" secundario onPress={salir} />
            </View>
          )}

          {pantalla === "buscar" && (
            <View style={s.tarjeta}>
              <Text style={s.titulo}>Identificar medidor</Text>

              <Text style={s.descripcion}>
                Ingresa el código de la etiqueta
              </Text>

              <TextInput
                style={s.input}
                placeholder="MED-123456"
                value={codigo}
                onChangeText={setCodigo}
                autoCapitalize="characters"
                maxLength={10}
              />

              {buscando ? (
                <ActivityIndicator />
              ) : (
                <Boton titulo="Buscar medidor" onPress={buscar} />
              )}

              <Boton
                titulo="Volver"
                secundario
                onPress={() => setPantalla("inicio")}
              />
            </View>
          )}

          {pantalla === "registro" && (
            <>
              <View style={s.tarjeta}>
                <Text style={s.titulo}>Medidor {codigo}</Text>

                {medidor ? (
                  <>
                    <Text>Dirección: {medidor.direccion}</Text>
                    <Text>Sector: {medidor.sector}</Text>
                    <Text>Cuenta: {medidor.numeroCuenta}</Text>
                    <Text>Estado: {medidor.estado}</Text>
                    <Text>Anterior: {medidor.ultimaLectura} m³</Text>
                    <Text>Fecha: {medidor.fechaUltimaLectura}</Text>
                    <Text>Promedio: {medidor.promedioMensual} m³</Text>
                  </>
                ) : (
                  <Text style={s.aviso}>
                    Sin datos previos. La lectura quedará pendiente de
                    verificación hasta recuperar la conexión.
                  </Text>
                )}
              </View>

              <View style={s.tarjeta}>
                <Text style={s.titulo}>Registrar lectura</Text>

                {(["normal", "inaccesible", "dañado"] as EstadoMedidor[]).map(
                  (opcion) => (
                    <TouchableOpacity
                      key={opcion}
                      style={[s.opcion, estado === opcion && s.opcionActiva]}
                      onPress={() => {
                        setEstado(opcion);
                        setConfirmado(false);
                      }}
                    >
                      <Text>
                        {estado === opcion ? "◉" : "○"} {opcion}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}

                {estado !== "inaccesible" && (
                  <TextInput
                    style={s.input}
                    placeholder="Lectura actual en m³"
                    keyboardType="numeric"
                    value={lectura}
                    onChangeText={setLectura}
                  />
                )}

                {estado === "inaccesible" && (
                  <TextInput
                    style={s.input}
                    placeholder="Motivo obligatorio"
                    value={motivo}
                    onChangeText={setMotivo}
                  />
                )}

                {estado === "dañado" && (
                  <TextInput
                    style={s.input}
                    placeholder="Descripción obligatoria del daño"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                  />
                )}

                {consumo !== null && (
                  <Text style={s.consumo}>Consumo: {consumo} m³</Text>
                )}

                {anomalo && (
                  <View style={s.advertencia}>
                    <Text>
                      ⚠ Consumo superior al triple del promedio mensual
                    </Text>

                    <TouchableOpacity
                      onPress={() => setConfirmado(!confirmado)}
                    >
                      <Text>
                        {confirmado ? "☑" : "☐"} Confirmo que revisé el medidor
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Boton
                  titulo={
                    fotoUri ? "📷 Cambiar fotografía" : "📷 Tomar fotografía"
                  }
                  onPress={tomarFoto}
                  secundario
                />

                {fotoUri && <Image source={{ uri: fotoUri }} style={s.foto} />}

                <Boton
                  titulo={editando ? "Guardar cambios" : "Guardar lectura"}
                  onPress={guardar}
                />

                <Boton
                  titulo="Volver al inicio"
                  secundario
                  onPress={() => setPantalla("inicio")}
                />
              </View>
            </>
          )}

          {pantalla === "pendientes" && (
            <>
              <Text style={s.titulo}>Historial de lecturas</Text>

              {lecturas.length === 0 && (
                <Text>Todavía no existen lecturas registradas.</Text>
              )}

              {lecturas.map((item) => (
                <View key={item.idLocal} style={s.tarjeta}>
                  <Text style={s.titulo}>{item.codigoMedidor}</Text>

                  <Text>Mes: {item.mes}</Text>

                  <Text>Estado: {item.estadoMedidor}</Text>

                  <Text>Lectura: {item.lecturaActual ?? "No registrada"}</Text>

                  <Text>
                    Consumo:{" "}
                    {item.consumo === null ? "Pendiente" : `${item.consumo} m³`}
                  </Text>

                  <Text>
                    {item.estadoSync === "enviado"
                      ? "✓ Enviado"
                      : item.pendienteVerificacion
                        ? "⚠ Pendiente de verificación"
                        : "⏳ Pendiente de envío"}
                  </Text>

                  {item.fotoUri && (
                    <Image source={{ uri: item.fotoUri }} style={s.foto} />
                  )}

                  {item.estadoSync === "pendiente" && (
                    <Boton
                      titulo="Editar lectura pendiente"
                      onPress={() => editar(item)}
                    />
                  )}
                </View>
              ))}

              <Boton
                titulo={
                  sincronizando
                    ? "Sincronizando..."
                    : "Actualizar y sincronizar"
                }
                onPress={() => sincronizar(true)}
              />

              <Boton
                titulo="Volver"
                secundario
                onPress={() => setPantalla("inicio")}
              />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "#EAF7F9",
  },
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  login: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#EAF7F9",
    padding: 24,
  },
  cabecera: {
    backgroundColor: "#102C46",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 18,
  },
  cabeceraTexto: {
    color: "#FFFFFF",
    marginTop: 4,
    fontSize: 12,
  },
  marca: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#25B5BF",
  },
  contenido: {
    padding: 18,
    paddingBottom: 45,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    gap: 11,
    elevation: 2,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#102C46",
  },
  descripcion: {
    color: "#56717F",
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#B8D5DD",
    backgroundColor: "#F7FBFC",
    padding: 13,
    borderRadius: 10,
    color: "#102C46",
  },
  boton: {
    backgroundColor: "#087E9D",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  botonSecundario: {
    backgroundColor: "#E4F2F5",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  textoSecundario: {
    color: "#102C46",
  },
  opcion: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C8DEE3",
  },
  opcionActiva: {
    backgroundColor: "#D5F3F1",
    borderColor: "#087E9D",
  },
  consumo: {
    color: "#087E9D",
    fontWeight: "bold",
    fontSize: 17,
  },
  aviso: {
    backgroundColor: "#FFF1D6",
    padding: 12,
    borderRadius: 10,
    color: "#895A11",
  },
  advertencia: {
    backgroundColor: "#FFF1D6",
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  foto: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    resizeMode: "cover",
  },
});
