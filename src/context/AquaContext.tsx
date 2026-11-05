
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
import {
  onAuthStateChanged,
  reload,
  signOut,
} from "firebase/auth";

import { auth } from "../config/firebase";
import { useConnectivity } from "../hooks/useConnectivity";
import {
  sincronizarLecturas,
  type ResultadoSync,
} from "../services/sync";
import {
  cerrarSesion,
  guardarSesion,
  obtenerLecturas,
  obtenerSesion,
  recuperarEnviosInterrumpidos,
} from "../storage/local";
import type { Lectura } from "../types/models";
import {
  conservarFotoPerfil,
  eliminarFotoPerfil,
  obtenerFotoPerfil,
} from "../storage/photoStorage";

interface AquaContexto {
  sesion: string | null;
  cargando: boolean;
  conectado: boolean;
  lecturas: Lectura[];
  sincronizando: boolean;
  fotoPerfilUri: string | null;
  entrar(codigo: string): Promise<void>;
  salir(): Promise<void>;
  actualizar(): Promise<void>;
  sincronizar(): Promise<ResultadoSync | null>;
  guardarFotoPerfil(uriTemporal: string): Promise<void>;
  borrarFotoPerfil(): Promise<void>;
}

const Contexto = createContext<AquaContexto | null>(null);

export function AquaProvider({ children }: PropsWithChildren) {
  const conectado = useConnectivity();

  const [sesion, setSesion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<{ uid: string; uri: string | null } | null>(null);
  const fotoPerfilUri = fotoPerfil?.uid === sesion ? fotoPerfil.uri : null;

  const sincronizandoRef = useRef(false);

  useEffect(() => {
    let activo = true;

    if (!sesion) return;

    const uid = sesion;
    void obtenerFotoPerfil(uid)
      .then((uri) => {
        if (activo) setFotoPerfil({ uid, uri });
      })
      .catch((error) => {
        console.log("Error al cargar foto de perfil:", error);
        if (activo) setFotoPerfil({ uid, uri: null });
      });

    return () => {
      activo = false;
    };
  }, [sesion]);

  const actualizar = useCallback(async () => {
    setLecturas(await obtenerLecturas());
  }, []);

  const sincronizar = useCallback(async () => {
    if (!conectado || !sesion || sincronizandoRef.current) {
      return null;
    }

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
    let activo = true;

    async function cargarLecturas() {
      try {
        const datos = await recuperarEnviosInterrumpidos();
        if (activo) setLecturas(datos);
      } catch {
        if (activo) setLecturas([]);
      }
    }

    void cargarLecturas();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;
    let revision = 0;

    const cancelar = onAuthStateChanged(
      auth,
      async (usuario) => {
        const actual = ++revision;

        if (activo) setCargando(true);

        try {
          if (!usuario) {
            await cerrarSesion();

            if (activo && actual === revision) {
              setSesion(null);
            }
            return;
          }

          // Comprobar el estado más reciente si hay conexión.
          if (conectado) {
            await reload(usuario);
          }

          if (!usuario.emailVerified) {
            await cerrarSesion();

            if (activo && actual === revision) {
              setSesion(null);
            }
            return;
          }

          if (!activo || actual !== revision) return;

          const sesionGuardada = await obtenerSesion();

          if (sesionGuardada !== usuario.uid) {
            await guardarSesion(usuario.uid);
          }

          if (activo && actual === revision) {
            setSesion(usuario.uid);
          }
        } catch (error) {
          console.log("Error al restaurar sesión:", error);

          if (activo && actual === revision) {
            setSesion(null);
          }
        } finally {
          if (activo && actual === revision) {
            setCargando(false);
          }
        }
      },
      (error) => {
        console.log("Error de Firebase:", error);

        if (activo) {
          setSesion(null);
          setCargando(false);
        }
      }
    );

    return () => {
      activo = false;
      revision++;
      cancelar();
    };
  }, [conectado]);

  useEffect(() => {
    if (!conectado || !sesion) return;

    const inicio = setTimeout(() => {
      void sincronizar();
    }, 0);

    const intervalo = setInterval(() => {
      void sincronizar();
    }, 15000);

    const suscripcion = AppState.addEventListener(
      "change",
      (estado) => {
        if (estado === "active") {
          void sincronizar();
        }
      }
    );

    return () => {
      clearTimeout(inicio);
      clearInterval(intervalo);
      suscripcion.remove();
    };
  }, [conectado, sesion, sincronizar]);

  async function entrar(codigo: string) {
    const usuario = auth.currentUser;

    if (!usuario) {
      throw new Error("No existe una sesión de Firebase.");
    }

    await reload(usuario);

    if (!usuario.emailVerified) {
      throw new Error("Primero debes verificar tu correo.");
    }

    if (usuario.uid !== codigo) {
      throw new Error("El usuario no coincide con la sesión.");
    }

    await guardarSesion(usuario.uid);
    setSesion(usuario.uid);
  }

  async function salir() {
    await signOut(auth);
    await cerrarSesion();
    setSesion(null);
  }

  async function guardarFotoPerfil(uriTemporal: string) {
    if (!sesion) throw new Error("No existe una sesión activa.");
    const uid = sesion;
    setFotoPerfil({ uid, uri: await conservarFotoPerfil(uriTemporal, uid) });
  }

  async function borrarFotoPerfil() {
    if (!sesion) throw new Error("No existe una sesión activa.");
    const uid = sesion;
    await eliminarFotoPerfil(uid);
    setFotoPerfil({ uid, uri: null });
  }

  return (
    <Contexto.Provider
      value={{
        sesion,
        cargando,
        conectado,
        lecturas,
        sincronizando,
        fotoPerfilUri,
        entrar,
        salir,
        actualizar,
        sincronizar,
        guardarFotoPerfil,
        borrarFotoPerfil,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAqua() {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error(
      "useAqua debe usarse dentro de AquaProvider."
    );
  }

  return contexto;
}
