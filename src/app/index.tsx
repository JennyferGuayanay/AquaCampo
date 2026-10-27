
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import type {
  Medidor,
  EstadoMedidor,
  Lectura
} from "../types/models";

import { obtenerMedidor } from "../services/api";

import {
  guardarSesion,
  obtenerSesion,
  cerrarSesion,
  guardarMedidor,
  obtenerMedidores,
  guardarLectura
} from "../storage/local";

import {
  validarCodigo,
  validarRegistro,
  calcularConsumo,
  esAnomalo
} from "../utils/rules";

export default function Inicio() {

  const [sesion, setSesion] = useState<string | null>(null);
  const [empleado, setEmpleado] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(true);

  const [codigo, setCodigo] = useState("");
  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [estado, setEstado] =
    useState<EstadoMedidor>("normal");

  const [lectura, setLectura] = useState("");
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  // Recuperar sesion al abrir la aplicacion
  useEffect(() => {
    obtenerSesion()
      .then(setSesion)
      .finally(() => setCargando(false));
  }, []);

  // Iniciar sesion con datos quemados
  async function iniciarSesion() {
    if (empleado !== "TEC001" || clave !== "123456") {
      Alert.alert("Error", "Credenciales incorrectas.");
      return;
    }

    await guardarSesion(empleado);
    setSesion(empleado);
  }

  // Cerrar sesion
  async function salir() {
    await cerrarSesion();
    setSesion(null);
    setMedidor(null);
    setCodigo("");
  }

  // Consultar medidor
  async function buscarMedidor() {
    setMedidor(null);

    if (!validarCodigo(codigo)) {
      Alert.alert(
        "Codigo incorrecto",
        "Debe tener el formato MED-123456."
      );
      return;
    }

    setBuscando(true);

    try {
      const guardados = await obtenerMedidores();

      // Buscar primero en cache
      if (guardados[codigo]) {
        setMedidor(guardados[codigo]);
        return;
      }

      // Consultar MockAPI
      const encontrado = await obtenerMedidor(codigo);

      if (!encontrado) {
        Alert.alert(
          "No encontrado",
          "El medidor no existe."
        );
        return;
      }

      await guardarMedidor(encontrado);
      setMedidor(encontrado);

    } catch {
      Alert.alert(
        "Sin conexion",
        "No se pudo consultar el medidor."
      );
    } finally {
      setBuscando(false);
    }
  }

  const numeroLectura = Number(lectura);

  // Calcular consumo
  const consumo =
    medidor &&
    lectura.trim() !== "" &&
    /^\d+$/.test(lectura.trim()) &&
    Number.isSafeInteger(numeroLectura)
      ? calcularConsumo(
          numeroLectura,
          medidor.ultimaLectura
        )
      : null;

  // Detectar consumo anomalo
  const anomalo =
    medidor &&
    consumo !== null &&
    esAnomalo(
      consumo,
      medidor.promedioMensual
    );

  // Guardar lectura
  async function registrar() {
    if (!medidor || !sesion) return;

    const error = validarRegistro(
      estado,
      estado === "inaccesible" ? "" : lectura,
      motivo,
      descripcion
    );

    if (error) {
      Alert.alert("Validacion", error);
      return;
    }

    if (
      estado !== "inaccesible" &&
      consumo !== null &&
      consumo < 0
    ) {
      Alert.alert(
        "Lectura incorrecta",
        "La lectura no puede ser menor que la anterior."
      );
      return;
    }

    if (
      estado !== "inaccesible" &&
      anomalo &&
      !confirmado
    ) {
      Alert.alert(
        "Consumo anomalo",
        "Confirme que reviso el medidor."
      );
      return;
    }

    // La camara se agregara en la siguiente fase
    if (
      estado === "dañado" ||
      (estado !== "inaccesible" && anomalo)
    ) {
      Alert.alert(
        "Fotografia obligatoria",
        "Debe agregar una fotografia. Esta funcion se implementara en la fase de camara."
      );
      return;
    }

    const ahora = new Date();

    const mes = `${ahora.getFullYear()}-${String(
      ahora.getMonth() + 1
    ).padStart(2, "0")}`;

    const registro: Lectura = {
      idLocal:
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      codigoMedidor: medidor.codigo,
      tecnico: sesion,
      fecha: ahora.toISOString(),
      mes,
      estadoMedidor: estado,
      lecturaActual:
        estado === "inaccesible" ||
        lectura.trim() === ""
          ? null
          : numeroLectura,
      consumo:
        estado === "inaccesible" ||
        lectura.trim() === ""
          ? null
          : consumo,
      motivo:
        estado === "inaccesible" ? motivo : "",
      descripcionDanio:
        descripcion,
      confirmacionAnomalia: confirmado,
      fotoUri: null,
      estadoSync: "pendiente",
      pendienteVerificacion: false,
    };

    try {
      await guardarLectura(registro);

      Alert.alert(
        "Guardado",
        "Lectura guardada localmente."
      );

      setMedidor(null);
      setCodigo("");
      setLectura("");
      setMotivo("");
      setDescripcion("");
      setConfirmado(false);
      setEstado("normal");

    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo guardar."
      );
    }
  }

  // Boton reutilizable
  function Boton({
    texto,
    accion
  }: {
    texto: string;
    accion: () => void;
  }) {
    return (
      <TouchableOpacity
        style={styles.boton}
        onPress={accion}
      >
        <Text style={styles.textoBoton}>
          {texto}
        </Text>
      </TouchableOpacity>
    );
  }

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator
          size="large"
          color="#087E9D"
        />
      </View>
    );
  }

  // Pantalla de login
  if (!sesion) {
    return (
      <View style={styles.contenedorLogin}>
        <Text style={styles.logo}>
          💧 AquaCampo
        </Text>

        <Text style={styles.subtitulo}>
          Gestion de lecturas de agua
        </Text>

        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>
            Acceso del tecnico
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Codigo de empleado"
            value={empleado}
            onChangeText={setEmpleado}
            autoCapitalize="characters"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={clave}
            onChangeText={setClave}
            secureTextEntry
          />

          <Boton
            texto="Iniciar sesion"
            accion={iniciarSesion}
          />
        </View>
      </View>
    );
  }

  // Pantalla principal
  return (
    <ScrollView
      style={styles.fondo}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.encabezado}>
        <Text style={styles.logo}>
          💧 AquaCampo
        </Text>

        <Text style={styles.textoClaro}>
          Tecnico: {sesion}
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>
          Consultar medidor
        </Text>

        <TextInput
          style={styles.input}
          placeholder="MED-123456"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
          maxLength={10}
        />

        {buscando ? (
          <ActivityIndicator color="#087E9D" />
        ) : (
          <Boton
            texto="Buscar medidor"
            accion={buscarMedidor}
          />
        )}
      </View>

      {medidor && (
        <>
          <View style={styles.tarjeta}>
            <Text style={styles.titulo}>
              Datos del medidor
            </Text>

            <Text>Codigo: {medidor.codigo}</Text>
            <Text>Direccion: {medidor.direccion}</Text>
            <Text>Sector: {medidor.sector}</Text>
            <Text>Cuenta: {medidor.numeroCuenta}</Text>
            <Text>Estado: {medidor.estado}</Text>
            <Text>
              Ultima lectura: {medidor.ultimaLectura}
            </Text>
            <Text>
              Fecha: {medidor.fechaUltimaLectura}
            </Text>
            <Text>
              Promedio mensual: {medidor.promedioMensual} m³
            </Text>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.titulo}>
              Registrar lectura
            </Text>

            <Text style={styles.etiqueta}>
              Estado del medidor
            </Text>

            {(
              [
                "normal",
                "inaccesible",
                "dañado"
              ] as EstadoMedidor[]
            ).map(opcion => (
              <TouchableOpacity
                key={opcion}
                style={[
                  styles.opcion,
                  estado === opcion &&
                    styles.opcionActiva
                ]}
                onPress={() => {
                  setEstado(opcion);
                  setConfirmado(false);
                }}
              >
                <Text>
                  {estado === opcion ? "●" : "○"} {opcion}
                </Text>
              </TouchableOpacity>
            ))}

            {estado !== "inaccesible" && (
              <TextInput
                style={styles.input}
                placeholder="Lectura actual"
                value={lectura}
                onChangeText={setLectura}
                keyboardType="numeric"
              />
            )}

            {estado === "inaccesible" && (
              <TextInput
                style={styles.input}
                placeholder="Motivo de inaccesibilidad"
                value={motivo}
                onChangeText={setMotivo}
              />
            )}

            {estado === "dañado" && (
              <TextInput
                style={styles.input}
                placeholder="Descripcion del daño"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
              />
            )}

            {estado !== "inaccesible" &&
              consumo !== null && (
                <Text style={styles.consumo}>
                  Consumo calculado: {consumo} m³
                </Text>
              )}

            {estado !== "inaccesible" &&
              anomalo && (
                <View style={styles.advertencia}>
                  <Text style={styles.textoAdvertencia}>
                    ⚠ Consumo superior al triple
                    del promedio mensual.
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setConfirmado(!confirmado)
                    }
                  >
                    <Text>
                      {confirmado ? "☑" : "☐"} Confirmo
                      que revise el medidor
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            <Boton
              texto="Guardar lectura"
              accion={registrar}
            />
          </View>
        </>
      )}

      <Boton
        texto="Cerrar sesion"
        accion={salir}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "#EAF7F9",
  },
  contenido: {
    padding: 18,
    paddingBottom: 50,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contenedorLogin: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EAF7F9",
  },
  encabezado: {
    backgroundColor: "#102C46",
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
  },
  logo: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#25B5BF",
    marginBottom: 8,
  },
  subtitulo: {
    color: "#526A78",
    marginBottom: 28,
    textAlign: "center",
  },
  textoClaro: {
    color: "#FFFFFF",
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    gap: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#102C46",
    marginBottom: 6,
  },
  etiqueta: {
    color: "#102C46",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#C7DDE2",
    borderRadius: 10,
    padding: 13,
    backgroundColor: "#F7FBFC",
    color: "#102C46",
  },
  boton: {
    backgroundColor: "#087E9D",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  opcion: {
    borderWidth: 1,
    borderColor: "#C7DDE2",
    borderRadius: 10,
    padding: 12,
  },
  opcionActiva: {
    backgroundColor: "#DDF4F4",
    borderColor: "#087E9D",
  },
  consumo: {
    fontWeight: "bold",
    color: "#087E9D",
    fontSize: 16,
  },
  advertencia: {
    backgroundColor: "#FFF1D6",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  textoAdvertencia: {
    color: "#9C5A00",
    fontWeight: "bold",
  },
});
