import type { Lectura, Medidor } from "../types/models";

const API_URL = "https://6a74ea0632ae11412783217c.mockapi.io/api";

// Consultar un medidor
export async function obtenerMedidor(codigo: string): Promise<Medidor | null> {
  const respuesta = await fetch(
    `${API_URL}/medidores?codigo=${encodeURIComponent(codigo)}`,
  );

  if (!respuesta.ok) {
    throw new Error("Error al consultar el medidor.");
  }

  const datos: Medidor[] = await respuesta.json();

  return datos.find((medidor) => medidor.codigo === codigo) ?? null;
}

// Enviar lectura al servidor
export async function enviarLectura(lectura: Lectura): Promise<void> {
  const respuesta = await fetch(`${API_URL}/lecturas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lectura),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo enviar la lectura.");
  }
}
