import AsyncStorage from "@react-native-async-storage/async-storage";

import { crearRepositorioLocal } from "./repository";

const repositorio = crearRepositorioLocal(AsyncStorage);

export const actualizarLectura = repositorio.actualizarLectura;
export const borrarBorrador = repositorio.borrarBorrador;
export const cerrarSesion = repositorio.cerrarSesion;
export const guardarBorrador = repositorio.guardarBorrador;
export const guardarLectura = repositorio.guardarLectura;
export const guardarMedidor = repositorio.guardarMedidor;
export const guardarSesion = repositorio.guardarSesion;
export const obtenerBorrador = repositorio.obtenerBorrador;
export const obtenerLecturas = repositorio.obtenerLecturas;
export const obtenerMedidores = repositorio.obtenerMedidores;
export const obtenerSesion = repositorio.obtenerSesion;
export const reemplazarLecturas = repositorio.reemplazarLecturas;
export const recuperarEnviosInterrumpidos = repositorio.recuperarEnviosInterrumpidos;
