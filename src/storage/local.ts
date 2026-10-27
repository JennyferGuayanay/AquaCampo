
import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  Medidor,
  Lectura
} from "../types/models";

const CLAVE_SESION = "aquacampo_sesion";
const CLAVE_MEDIDORES = "aquacampo_medidores";
const CLAVE_LECTURAS = "aquacampo_lecturas";

// R1: Guardar sesion
export async function guardarSesion(codigo: string) {
  await AsyncStorage.setItem(CLAVE_SESION, codigo);
}

// R1: Recuperar sesion
export async function obtenerSesion() {
  return await AsyncStorage.getItem(CLAVE_SESION);
}

// R1: Cerrar sesion
export async function cerrarSesion() {
  await AsyncStorage.removeItem(CLAVE_SESION);
}

// R3: Guardar medidor en cache local
export async function guardarMedidor(medidor: Medidor) {
  const medidores = await obtenerMedidores();

  medidores[medidor.codigo] = medidor;

  await AsyncStorage.setItem(
    CLAVE_MEDIDORES,
    JSON.stringify(medidores)
  );
}

// R3: Recuperar medidores guardados
export async function obtenerMedidores():
  Promise<Record<string, Medidor>> {

  const datos = await AsyncStorage.getItem(CLAVE_MEDIDORES);

  return datos ? JSON.parse(datos) : {};
}

// R4: Obtener lecturas locales
export async function obtenerLecturas(): Promise<Lectura[]> {

  const datos = await AsyncStorage.getItem(CLAVE_LECTURAS);

  return datos ? JSON.parse(datos) : [];
}

// R4 y R10: Guardar lectura pendiente
export async function guardarLectura(lectura: Lectura) {

  const lecturas = await obtenerLecturas();

  const duplicada = lecturas.some(
    item =>
      item.codigoMedidor === lectura.codigoMedidor &&
      item.mes === lectura.mes
  );

  if (duplicada) {
    throw new Error(
      "Este medidor ya tiene una lectura registrada este mes."
    );
  }

  lecturas.push(lectura);

  await AsyncStorage.setItem(
    CLAVE_LECTURAS,
    JSON.stringify(lecturas)
  );
}
