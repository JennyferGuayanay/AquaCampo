
import type { EstadoMedidor } from "../types/models";

export function validarCodigo(codigo: string) {
  return /^MED-[0-9]{6}$/.test(codigo);
}

export function calcularConsumo(actual: number, anterior: number) {
  return actual - anterior;
}

export function esAnomalo(consumo: number, promedio: number) {
  return consumo > promedio * 3;
}

export function validarRegistro(
  estado: EstadoMedidor,
  lectura: string,
  motivo: string,
  descripcion: string
): string | null {
  if (estado === "normal" && !lectura.trim()) {
    return "La lectura es obligatoria.";
  }

  if (estado === "inaccesible" && !motivo.trim()) {
    return "Debe indicar el motivo.";
  }

  if (estado === "dañado" && !descripcion.trim()) {
    return "Debe describir el daño.";
  }

  if (estado !== "inaccesible" && lectura.trim()) {
    const numero = Number(lectura);
    if (!/^\d+$/.test(lectura.trim()) ||
        !Number.isSafeInteger(numero)) {
      return "La lectura debe ser un número entero válido.";
    }
  }

  return null;
}
