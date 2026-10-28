
import type { Medidor, Lectura } from "../types/models";

const API_URL =
  "https://6a74ea0632ae11412783217c.mockapi.io/api";

export async function obtenerMedidor(
  codigo: string
): Promise<Medidor | null> {
  const respuesta = await fetch(
    `${API_URL}/medidores?codigo=${encodeURIComponent(codigo)}`
  );

  if (!respuesta.ok) throw new Error("Error al consultar medidor");

  const datos: Medidor[] = await respuesta.json();
  return datos.find(m => m.codigo === codigo) ?? null;
}

export async function obtenerLecturasRemotas(): Promise<Lectura[]> {
  const respuesta = await fetch(`${API_URL}/lecturas`);

  if (!respuesta.ok) throw new Error("Error al consultar lecturas");

  return respuesta.json();
}

export async function enviarLectura(
  lectura: Lectura
): Promise<void> {
  const respuesta = await fetch(`${API_URL}/lecturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lectura),
  });

  if (!respuesta.ok) throw new Error("Error al enviar lectura");
}

