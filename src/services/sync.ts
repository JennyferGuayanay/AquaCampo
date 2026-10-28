
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

export interface ResultadoSync {
  enviados: number;
  verificacion: number;
  conflictos: number;
  errores: number;
}

let sincronizando = false;

export async function sincronizarLecturas(): Promise<ResultadoSync> {
  const resultado: ResultadoSync = {
    enviados: 0,
    verificacion: 0,
    conflictos: 0,
    errores: 0,
  };

  if (sincronizando) return resultado;

  sincronizando = true;

  try {
    const lecturas = await obtenerLecturas();
    const medidores = await obtenerMedidores();

    for (const lectura of lecturas) {
      if (lectura.estadoSync === "enviado") continue;

      try {
        if (lectura.pendienteVerificacion) {
          const medidor =
            medidores[lectura.codigoMedidor] ??
            (await obtenerMedidor(lectura.codigoMedidor));

          if (!medidor) {
            resultado.verificacion++;
            continue;
          }

          await guardarMedidor(medidor);

          if (lectura.lecturaActual !== null) {
            const consumo = calcularConsumo(
              lectura.lecturaActual,
              Number(medidor.ultimaLectura)
            );

            if (consumo < 0) {
              resultado.verificacion++;
              continue;
            }

            lectura.consumo = consumo;

            const anomalia = esAnomalo(
              consumo,
              Number(medidor.promedioMensual)
            );

            if (
              anomalia &&
              (!lectura.confirmacionAnomalia || !lectura.fotoUri)
            ) {
              // No enviar hasta que el técnico revise el registro.
              resultado.verificacion++;
              continue;
            }
          }

          lectura.pendienteVerificacion = false;
          await reemplazarLecturas(lecturas);
        }

        const remotas = await obtenerLecturasRemotas();

        const mismoId = remotas.some(
          (r) => r.idLocal === lectura.idLocal
        );

        if (mismoId) {
          lectura.estadoSync = "enviado";
          await reemplazarLecturas(lecturas);
          resultado.enviados++;
          continue;
        }

        const duplicado = remotas.some(
          (r) =>
            r.codigoMedidor === lectura.codigoMedidor &&
            r.mes === lectura.mes
        );

        if (duplicado) {
          resultado.conflictos++;
          continue;
        }

        await enviarLectura(lectura);

        lectura.estadoSync = "enviado";
        await reemplazarLecturas(lecturas);
        resultado.enviados++;
      } catch {
        resultado.errores++;
        // No descartar la lectura si falla la red.
        break;
      }
    }

    return resultado;
  } finally {
    sincronizando = false;
  }
}
