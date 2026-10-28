
import * as FileSystem from "expo-file-system/legacy";

export async function conservarFoto(uriTemporal: string) {
  const carpeta = FileSystem.documentDirectory + "fotos/";

  const info = await FileSystem.getInfoAsync(carpeta);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(carpeta, {
      intermediates: true,
    });
  }

  const destino = carpeta +
    `medidor_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

  await FileSystem.copyAsync({
    from: uriTemporal,
    to: destino,
  });

  return destino;
}
