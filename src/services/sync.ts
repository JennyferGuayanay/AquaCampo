import {
  actualizarLectura,
  guardarMedidor,
  obtenerLecturas,
  obtenerMedidores,
} from "../storage/local";
import {
  enviarLectura,
  obtenerLecturasRemotas,
  obtenerMedidor,
} from "./api";
import { crearSincronizador } from "./syncCore";

export type { ResultadoSync } from "./syncCore";

export const sincronizarLecturas = crearSincronizador({
  obtenerLecturas,
  actualizarLectura,
  obtenerMedidores,
  guardarMedidor,
  obtenerMedidor,
  obtenerLecturasRemotas,
  enviarLectura,
});
