import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { useConnectivity } from "../hooks/useConnectivity";
import { sincronizarLecturas, type ResultadoSync } from "../services/sync";
import {
  cerrarSesion,
  guardarSesion,
  obtenerLecturas,
  obtenerSesion,
  recuperarEnviosInterrumpidos,
} from "../storage/local";
import type { Lectura } from "../types/models";

interface AquaContexto {
  sesion: string | null;
  cargando: boolean;
  conectado: boolean;
  lecturas: Lectura[];
  sincronizando: boolean;
  entrar(codigo: string): Promise<void>;
  salir(): Promise<void>;
  actualizar(): Promise<void>;
  sincronizar(): Promise<ResultadoSync | null>;
}

const Contexto = createContext<AquaContexto | null>(null);

export function AquaProvider({ children }: PropsWithChildren) {
  const conectado = useConnectivity();
  const [sesion, setSesion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [sincronizando, setSincronizando] = useState(false);
  const sincronizandoRef = useRef(false);

  const actualizar = useCallback(async () => {
    setLecturas(await obtenerLecturas());
  }, []);

  const sincronizar = useCallback(async () => {
    if (!conectado || !sesion || sincronizandoRef.current) return null;
    sincronizandoRef.current = true;
    setSincronizando(true);
    try {
      const resultado = await sincronizarLecturas();
      await actualizar();
      return resultado;
    } catch {
      return {
        enviados: 0,
        verificacion: 0,
        conflictos: 0,
        inciertos: 0,
        errores: 1,
      };
    } finally {
      sincronizandoRef.current = false;
      setSincronizando(false);
    }
  }, [actualizar, conectado, sesion]);

  useEffect(() => {
    async function iniciar() {
      try {
        setSesion(await obtenerSesion());
      } catch {
        setSesion(null);
      }
      try {
        setLecturas(await recuperarEnviosInterrumpidos());
      } catch {
        setLecturas([]);
      }
      setCargando(false);
    }
    void iniciar();
  }, []);

  useEffect(() => {
    if (!conectado || !sesion) return;
    const inicio = setTimeout(() => void sincronizar(), 0);
    const intervalo = setInterval(() => void sincronizar(), 15000);
    const suscripcion = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void sincronizar();
    });
    return () => {
      clearTimeout(inicio);
      clearInterval(intervalo);
      suscripcion.remove();
    };
  }, [conectado, sesion, sincronizar]);

  async function entrar(codigo: string) {
    await guardarSesion(codigo);
    setSesion(codigo);
  }

  async function salir() {
    await cerrarSesion();
    setSesion(null);
  }

  return (
    <Contexto.Provider
      value={{
        sesion,
        cargando,
        conectado,
        lecturas,
        sincronizando,
        entrar,
        salir,
        actualizar,
        sincronizar,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAqua() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAqua debe usarse dentro de AquaProvider.");
  return contexto;
}
