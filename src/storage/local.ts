
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Medidor, Lectura, Borrador } from "../types/models";

const SESION = "aqua_sesion";
const MEDIDORES = "aqua_medidores";
const LECTURAS = "aqua_lecturas";
const BORRADOR = "aqua_borrador";

export async function guardarSesion(codigo: string) {
  await AsyncStorage.setItem(SESION, codigo);
}

export async function obtenerSesion() {
  return AsyncStorage.getItem(SESION);
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(SESION);
}

export async function obtenerMedidores():
  Promise<Record<string, Medidor>> {
  const dato = await AsyncStorage.getItem(MEDIDORES);
  return dato ? JSON.parse(dato) : {};
}

export async function guardarMedidor(medidor: Medidor) {
  const todos = await obtenerMedidores();
  todos[medidor.codigo] = medidor;
  await AsyncStorage.setItem(MEDIDORES, JSON.stringify(todos));
}

export async function obtenerLecturas(): Promise<Lectura[]> {
  const dato = await AsyncStorage.getItem(LECTURAS);
  return dato ? JSON.parse(dato) : [];
}

export async function reemplazarLecturas(lecturas: Lectura[]) {
  await AsyncStorage.setItem(LECTURAS, JSON.stringify(lecturas));
}

export async function guardarLectura(lectura: Lectura) {
  const todas = await obtenerLecturas();

  const duplicada = todas.some(
    l => l.codigoMedidor === lectura.codigoMedidor &&
         l.mes === lectura.mes &&
         l.idLocal !== lectura.idLocal
  );

  if (duplicada) {
    throw new Error("El medidor ya tiene registro este mes.");
  }

  const indice = todas.findIndex(l => l.idLocal === lectura.idLocal);

  if (indice >= 0) {
    if (todas[indice].estadoSync === "enviado") {
      throw new Error("Una lectura enviada no se puede editar.");
    }
    todas[indice] = lectura;
  } else {
    todas.push(lectura);
  }

  await reemplazarLecturas(todas);
}

export async function guardarBorrador(borrador: Borrador) {
  await AsyncStorage.setItem(BORRADOR, JSON.stringify(borrador));
}

export async function obtenerBorrador(): Promise<Borrador | null> {
  const dato = await AsyncStorage.getItem(BORRADOR);
  return dato ? JSON.parse(dato) : null;
}

export async function borrarBorrador() {
  await AsyncStorage.removeItem(BORRADOR);
}
