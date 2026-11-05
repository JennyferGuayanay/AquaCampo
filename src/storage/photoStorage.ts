
import * as FileSystem from "expo-file-system/legacy";

const carpetaFotos = FileSystem.documentDirectory + "fotos/";

async function asegurarCarpetaFotos() {
  const info = await FileSystem.getInfoAsync(carpetaFotos);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(carpetaFotos, { intermediates: true });
  }
}

export async function conservarFoto(uriTemporal: string) {
  await asegurarCarpetaFotos();

  const destino = carpetaFotos +
    `medidor_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

  await FileSystem.copyAsync({
    from: uriTemporal,
    to: destino,
  });

  return destino;
}

function rutaFotoPerfil(uid: string) {
  return `${carpetaFotos}perfil_${uid.replace(/[^a-zA-Z0-9_-]/g, "_")}.jpg`;
}

export async function obtenerFotoPerfil(uid: string) {
  const ruta = rutaFotoPerfil(uid);
  const info = await FileSystem.getInfoAsync(ruta);
  return info.exists ? `${ruta}?actualizada=${info.modificationTime}` : null;
}

export async function conservarFotoPerfil(uriTemporal: string, uid: string) {
  await asegurarCarpetaFotos();
  const destino = rutaFotoPerfil(uid);
  const existente = await FileSystem.getInfoAsync(destino);

  if (existente.exists) {
    await FileSystem.deleteAsync(destino, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: uriTemporal, to: destino });
  return obtenerFotoPerfil(uid);
}

export async function eliminarFotoPerfil(uid: string) {
  await FileSystem.deleteAsync(rutaFotoPerfil(uid), { idempotent: true });
}
