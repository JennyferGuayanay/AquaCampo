
import type { EstadoMedidor } from "../types/models";

// R2: Formato MED- seguido de seis numeros
export function validarCodigo(codigo: string): boolean {
  return /^MED-[0-9]{6}$/.test(codigo);
}

// R6: Calcular el consumo mensual
export function calcularConsumo(
  lecturaActual: number,
  lecturaAnterior: number
): number {
  return lecturaActual - lecturaAnterior;
}

// R6: Detectar consumo anomalo
export function esAnomalo(
  consumo: number,
  promedioMensual: number
): boolean {
  return consumo > promedioMensual * 3;
}

// R5: Validaciones segun estado
export function validarRegistro(
  estado: EstadoMedidor,
  lectura: string,
  motivo: string,
  descripcion: string
): string | null {

  if (estado === "normal" && lectura.trim() === "") {
    return "La lectura es obligatoria.";
  }

  if (estado === "inaccesible") {
    if (motivo.trim() === "") {
      return "Debe indicar el motivo de inaccesibilidad.";
    }

    if (lectura.trim() !== "") {
      return "No se permite lectura en estado inaccesible.";
    }
  }

  if (estado === "dañado" && descripcion.trim() === "") {
    return "Debe describir el daño del medidor.";
  }

  if (estado !== "inaccesible" && lectura.trim() !== "") {
    const numero = Number(lectura);

    if (
      !/^\d+$/.test(lectura.trim()) ||
      !Number.isSafeInteger(numero)
    ) {
      return "Ingrese una lectura numerica valida.";
    }
  }

  return null;
}
