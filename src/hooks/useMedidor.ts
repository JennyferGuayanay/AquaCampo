import { useCallback, useEffect, useState } from "react";

import { useAqua } from "../context/AquaContext";
import { obtenerMedidor } from "../services/api";
import { guardarMedidor, obtenerMedidores } from "../storage/local";
import type { Medidor } from "../types/models";
import { validarCodigo } from "../utils/rules";

export function useMedidor(codigo: string) {
  const { conectado } = useAqua();
  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (forzarRemoto = false) => {
      const normalizado = codigo.trim().toUpperCase();
      if (!validarCodigo(normalizado)) {
        setError("El código del medidor no tiene un formato válido.");
        setMedidor(null);
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);
      try {
        const cache = await obtenerMedidores();
        if (cache[normalizado] && !forzarRemoto) {
          setMedidor(cache[normalizado]);
          return;
        }

        if (!conectado) {
          setMedidor(cache[normalizado] ?? null);
          if (!cache[normalizado]) {
            setError("No hay datos guardados para este medidor.");
          }
          return;
        }

        const remoto = await obtenerMedidor(normalizado);
        if (!remoto) {
          setMedidor(null);
          setError("El medidor no existe en el registro remoto.");
          return;
        }
        await guardarMedidor(remoto);
        setMedidor(remoto);
      } catch {
        setError("No se pudo consultar el medidor en este momento.");
      } finally {
        setCargando(false);
      }
    },
    [codigo, conectado],
  );

  useEffect(() => {
    const temporizador = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(temporizador);
  }, [cargar]);

  return { medidor, cargando, error, recargar: () => cargar(true) };
}
