import type { Lectura, Medidor } from "../types/models";
import { calcularConsumo, esAnomalo } from "../utils/rules";

export interface ResultadoSync {
  enviados: number;
  verificacion: number;
  conflictos: number;
  inciertos: number;
  errores: number;
}

interface DependenciasSync {
  obtenerLecturas(): Promise<Lectura[]>;
  actualizarLectura(
    idLocal: string,
    cambio: Partial<Lectura> | ((actual: Lectura) => Lectura),
  ): Promise<Lectura>;
  obtenerMedidores(): Promise<Record<string, Medidor>>;
  guardarMedidor(medidor: Medidor): Promise<void>;
  obtenerMedidor(codigo: string): Promise<Medidor | null>;
  obtenerLecturasRemotas(): Promise<Lectura[]>;
  enviarLectura(lectura: Lectura): Promise<Lectura & { id?: string }>;
}

function crearConflicto(
  tipo: NonNullable<Lectura["conflicto"]>["tipo"],
  detalle: string,
) {
  return {
    tipo,
    detalle,
    detectadoEn: new Date().toISOString(),
  };
}

function mismoContenido(local: Lectura, remoto: Lectura) {
  return (
    local.codigoMedidor === remoto.codigoMedidor &&
    local.tecnico === remoto.tecnico &&
    local.fecha === remoto.fecha &&
    local.mes === remoto.mes &&
    local.estadoMedidor === remoto.estadoMedidor &&
    local.lecturaActual === remoto.lecturaActual &&
    local.consumo === remoto.consumo &&
    local.motivo === remoto.motivo &&
    local.descripcionDanio === remoto.descripcionDanio &&
    local.confirmacionAnomalia === remoto.confirmacionAnomalia &&
    local.fotoUri === remoto.fotoUri &&
    local.pendienteVerificacion === remoto.pendienteVerificacion
  );
}

export function crearSincronizador(dependencias: DependenciasSync) {
  let sincronizando = false;

  return async function sincronizar(): Promise<ResultadoSync> {
    const resultado: ResultadoSync = {
      enviados: 0,
      verificacion: 0,
      conflictos: 0,
      inciertos: 0,
      errores: 0,
    };

    if (sincronizando) return resultado;
    sincronizando = true;

    try {
      const lecturas = await dependencias.obtenerLecturas();
      const medidores = await dependencias.obtenerMedidores();

      let remotas: Lectura[];

      try {
        remotas = await dependencias.obtenerLecturasRemotas();
      } catch {
        resultado.errores++;
        return resultado;
      }

      for (const original of lecturas) {
        if (original.estadoSync === "enviado") {
          continue;
        }

        if (original.estadoSync === "conflicto") {
          resultado.conflictos++;
          continue;
        }

        let lectura = original;

        // R9: recuperar envios interrumpidos.
        if (lectura.estadoSync === "enviando") {
          lectura = await dependencias.actualizarLectura(lectura.idLocal, {
            estadoSync: "incierto",
          });
        }

        // R9: comprobar si el servidor ya recibio la lectura.
        const remotaMismoId = remotas.find(
          (item) => item.idLocal === lectura.idLocal,
        );

        if (remotaMismoId) {
          if (!mismoContenido(lectura, remotaMismoId)) {
            await dependencias.actualizarLectura(lectura.idLocal, {
              estadoSync: "conflicto",
              conflicto: crearConflicto(
                "respuesta_divergente",
                "Existe un registro remoto con el mismo identificador, pero sus datos son diferentes.",
              ),
            });

            resultado.conflictos++;
            continue;
          }

          await dependencias.actualizarLectura(lectura.idLocal, {
            estadoSync: "enviado",
            conflicto: null,
            enviadoEn: new Date().toISOString(),
            idRemoto: "id" in remotaMismoId ? String(remotaMismoId.id) : null,
          });

          resultado.enviados++;
          continue;
        }

        if (lectura.estadoSync === "incierto") {
          await dependencias.actualizarLectura(lectura.idLocal, {
            estadoSync: "pendiente",
          });

          resultado.inciertos++;
          continue;
        }

        // R4: revisar lecturas pendientes de verificacion.
        if (lectura.pendienteVerificacion) {
          let medidor: Medidor | undefined = medidores[lectura.codigoMedidor];

          if (!medidor) {
            try {
              medidor =
                (await dependencias.obtenerMedidor(lectura.codigoMedidor)) ??
                undefined;
            } catch {
              resultado.errores++;
              continue;
            }
          }

          if (!medidor) {
            await dependencias.actualizarLectura(lectura.idLocal, {
              estadoSync: "conflicto",
              conflicto: crearConflicto(
                "medidor_no_encontrado",
                "El codigo no existe en el registro remoto y requiere revision.",
              ),
            });

            resultado.conflictos++;
            continue;
          }

          await dependencias.guardarMedidor(medidor);

          let consumo: number | null = null;

          // R4: nunca convertir una lectura anterior null a 0.
          if (lectura.lecturaActual !== null && medidor.ultimaLectura != null) {
            consumo = calcularConsumo(
              lectura.lecturaActual,
              Number(medidor.ultimaLectura),
            );

            if (consumo < 0) {
              await dependencias.actualizarLectura(lectura.idLocal, {
                consumo,
                estadoSync: "conflicto",
                conflicto: crearConflicto(
                  "lectura_invalida",
                  "La lectura es menor que la lectura anterior del medidor.",
                ),
              });

              resultado.conflictos++;
              continue;
            }

            // R6: comprobar anomalías al reconectar.
            if (
              esAnomalo(consumo, Number(medidor.promedioMensual)) &&
              (!lectura.confirmacionAnomalia || !lectura.fotoUri)
            ) {
              await dependencias.actualizarLectura(lectura.idLocal, {
                consumo,
                estadoSync: "conflicto",
                conflicto: crearConflicto(
                  "anomalia_reconexion",
                  "El consumo supera tres veces el promedio. Confirma la revision y adjunta una foto.",
                ),
              });

              resultado.verificacion++;
              resultado.conflictos++;
              continue;
            }
          }

          // R4: conservar la marca si falta la lectura anterior.
          const requiereVerificacion =
            lectura.lecturaActual !== null && medidor.ultimaLectura == null;

          lectura = await dependencias.actualizarLectura(lectura.idLocal, {
            consumo,
            pendienteVerificacion: requiereVerificacion,
            conflicto: null,
          });

          if (requiereVerificacion) {
            resultado.verificacion++;
          }
        }

        // R10: evitar otra lectura del mismo medidor y mes.
        const duplicada = remotas.find(
          (item) =>
            item.codigoMedidor === lectura.codigoMedidor &&
            item.mes === lectura.mes &&
            item.idLocal !== lectura.idLocal,
        );

        if (duplicada) {
          await dependencias.actualizarLectura(lectura.idLocal, {
            estadoSync: "conflicto",
            conflicto: crearConflicto(
              "duplicado_remoto",
              "Ya existe otra lectura remota para este medidor y mes.",
            ),
          });

          resultado.conflictos++;
          continue;
        }

        // R9: marcar el intento antes de enviar.
        lectura = await dependencias.actualizarLectura(lectura.idLocal, {
          estadoSync: "enviando",
          intentoEn: new Date().toISOString(),
        });

        try {
          const remota = await dependencias.enviarLectura(lectura);

          if (!mismoContenido(lectura, remota)) {
            await dependencias.actualizarLectura(lectura.idLocal, {
              estadoSync: "conflicto",
              conflicto: crearConflicto(
                "respuesta_divergente",
                "El servidor respondio con datos diferentes a la lectura enviada.",
              ),
            });

            resultado.conflictos++;
            continue;
          }

          await dependencias.actualizarLectura(lectura.idLocal, {
            estadoSync: "enviado",
            enviadoEn: new Date().toISOString(),
            idRemoto: remota.id ? String(remota.id) : null,
          });

          remotas.push(remota);
          resultado.enviados++;
        } catch (error) {
          const status =
            typeof error === "object" && error && "status" in error
              ? Number(error.status)
              : null;

          const esErrorCorregible =
            status !== null && [400, 409, 422].includes(status);

          await dependencias.actualizarLectura(lectura.idLocal, {
            estadoSync: esErrorCorregible ? "conflicto" : "incierto",
            conflicto: esErrorCorregible
              ? crearConflicto(
                  "respuesta_divergente",
                  "El servidor rechazo los datos. Revisa la lectura antes de intentar nuevamente.",
                )
              : null,
          });

          if (esErrorCorregible) {
            resultado.conflictos++;
          } else {
            resultado.inciertos++;
          }

          resultado.errores++;
        }
      }

      return resultado;
    } finally {
      sincronizando = false;
    }
  };
}
