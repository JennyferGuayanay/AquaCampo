
import type { Medidor, Lectura } from "../types/models";

const API_URL =
  "https://6a74ea0632ae11412783217c.mockapi.io/api";

export class ErrorApi extends Error {
  constructor(
    mensaje: string,
    readonly status: number,
  ) {
    super(mensaje);
  }
}

async function solicitar(url: string, opciones?: RequestInit) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 10000);
  try {
    return await fetch(url, { ...opciones, signal: controlador.signal });
  } finally {
    clearTimeout(temporizador);
  }
}

export async function obtenerMedidor(
  codigo: string
): Promise<Medidor | null> {
  const respuesta = await solicitar(
    `${API_URL}/medidores?codigo=${encodeURIComponent(codigo)}`
  );

  if (!respuesta.ok) throw new Error("Error al consultar medidor");

  const datos: Medidor[] = await respuesta.json();
  return datos.find(m => m.codigo === codigo) ?? null;
}

export async function obtenerLecturasRemotas(): Promise<Lectura[]> {
  const respuesta = await solicitar(`${API_URL}/lecturas`);

  if (!respuesta.ok) throw new Error("Error al consultar lecturas");

  return respuesta.json();
}

export async function enviarLectura(
  lectura: Lectura
): Promise<Lectura & { id?: string }> {
  const respuesta = await solicitar(`${API_URL}/lecturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lectura, estadoSync: "enviado" }),
  });

  if (!respuesta.ok) {
    throw new ErrorApi(
      `Error HTTP ${respuesta.status} al enviar lectura`,
      respuesta.status,
    );
  }

  return respuesta.json();
}

