
import {
  obtenerLecturas,
  reemplazarLecturas,
  obtenerMedidores,
  guardarMedidor,
} from "../storage/local";

import {
  obtenerLecturasRemotas,
  obtenerMedidor,
  enviarLectura,
} from "./api";

import { calcularConsumo, esAnomalo } from "../utils/rules";

let sincronizando = false;

export async function sincronizarLecturas() {
  if (sincronizando) return;

  sincronizando = true;

  try {
    const lecturas = await obtenerLecturas();
    const medidores = await obtenerMedidores();

    for (const lectura of lecturas) {
      if (lectura.estadoSync === "enviado") continue;

      if (lectura.pendienteVerificacion) {
        try {
          const medidor = await obtenerMedidor(
            lectura.codigoMedidor
          );

          if (!medidor) continue;

          await guardarMedidor(medidor);
          medidores[medidor.codigo] = medidor;

          if (lectura.lecturaActual !== null) {
            const consumo = calcularConsumo(
              lectura.lecturaActual,
              medidor.ultimaLectura
            );

            if (consumo < 0) continue;

            lectura.consumo = consumo;

            if (
              esAnomalo(consumo, medidor.promedioMensual) &&
              (!lectura.confirmacionAnomalia || !lectura.fotoUri)
            ) {
              continue;
            }
          }

          lectura.pendienteVerificacion = false;
          await reemplazarLecturas(lecturas);
        } catch {
          continue;
        }
      }

      try {
        // Consultar antes de enviar para reducir duplicados
        const remotas = await obtenerLecturasRemotas();

        const existente = remotas.find(
          r => r.idLocal === lectura.idLocal
        );

        if (existente) {
          lectura.estadoSync = "enviado";
          await reemplazarLecturas(lecturas);
          continue;
        }

        const duplicadoMes = remotas.some(
          r => r.codigoMedidor === lectura.codigoMedidor &&
               r.mes === lectura.mes
        );

        if (duplicadoMes) continue;

        await enviarLectura(lectura);
        lectura.estadoSync = "enviado";
        await reemplazarLecturas(lecturas);
      } catch {
        // Se mantiene pendiente para el próximo intento
        break;
      }
    }
  } finally {
    sincronizando = false;
  }
}
