import type { Borrador, Lectura, Medidor } from "../types/models";

export interface AlmacenamientoClaveValor {
  getItem(clave: string): Promise<string | null>;
  setItem(clave: string, valor: string): Promise<void>;
  removeItem(clave: string): Promise<void>;
}

const SESION = "aqua_sesion";
const MEDIDORES = "aqua_medidores";
const LECTURAS = "aqua_lecturas";
const BORRADOR_ANTERIOR = "aqua_borrador";

function claveBorrador(tecnico: string) {
  return `aqua_borrador:${tecnico}`;
}

function normalizarLectura(lectura: Lectura): Lectura {
  return {
    ...lectura,
    conflicto: lectura.conflicto ?? null,
    intentoEn: lectura.intentoEn ?? null,
    enviadoEn: lectura.enviadoEn ?? null,
    idRemoto: lectura.idRemoto ?? null,
    actualizadoEn: lectura.actualizadoEn ?? lectura.fecha,
  };
}

export function crearRepositorioLocal(adaptador: AlmacenamientoClaveValor) {
  let cola: Promise<unknown> = Promise.resolve();

  function exclusivo<T>(operacion: () => Promise<T>): Promise<T> {
    const resultado = cola.then(operacion, operacion);
    cola = resultado.then(
      () => undefined,
      () => undefined,
    );
    return resultado;
  }

  async function leerLecturas() {
    const dato = await adaptador.getItem(LECTURAS);
    const lecturas: Lectura[] = dato ? JSON.parse(dato) : [];
    return lecturas.map(normalizarLectura);
  }

  async function escribirLecturas(lecturas: Lectura[]) {
    await adaptador.setItem(LECTURAS, JSON.stringify(lecturas));
  }

  return {
    async guardarSesion(codigo: string) {
      await adaptador.setItem(SESION, codigo);
    },

    async obtenerSesion() {
      return adaptador.getItem(SESION);
    },

    async cerrarSesion() {
      await adaptador.removeItem(SESION);
    },

    async obtenerMedidores(): Promise<Record<string, Medidor>> {
      const dato = await adaptador.getItem(MEDIDORES);
      return dato ? JSON.parse(dato) : {};
    },

    async guardarMedidor(medidor: Medidor) {
      return exclusivo(async () => {
        const dato = await adaptador.getItem(MEDIDORES);
        const medidores: Record<string, Medidor> = dato ? JSON.parse(dato) : {};
        medidores[medidor.codigo] = medidor;
        await adaptador.setItem(MEDIDORES, JSON.stringify(medidores));
      });
    },

    async obtenerLecturas() {
      await cola;
      return leerLecturas();
    },

    async recuperarEnviosInterrumpidos() {
      return exclusivo(async () => {
        const lecturas = await leerLecturas();
        let cambio = false;
        const recuperadas = lecturas.map((lectura) => {
          if (lectura.estadoSync !== "enviando") return lectura;
          cambio = true;
          return { ...lectura, estadoSync: "incierto" as const };
        });
        if (cambio) await escribirLecturas(recuperadas);
        return recuperadas;
      });
    },

    async guardarLectura(lectura: Lectura) {
      return exclusivo(async () => {
        const lecturas = await leerLecturas();
        const indice = lecturas.findIndex(
          (item) => item.idLocal === lectura.idLocal,
        );
        const almacenada = indice >= 0 ? lecturas[indice] : null;

        if (
          almacenada &&
          !["pendiente", "conflicto"].includes(almacenada.estadoSync)
        ) {
          throw new Error(
            "La lectura ya está en proceso de envío o fue enviada y no se puede editar.",
          );
        }

        const codigo = lectura.codigoMedidor.trim().toUpperCase();
        const duplicada = lecturas.some(
          (item) =>
            item.codigoMedidor.trim().toUpperCase() === codigo &&
            item.mes === lectura.mes &&
            item.idLocal !== lectura.idLocal,
        );

        if (duplicada) {
          throw new Error("El medidor ya tiene registro este mes.");
        }

        const actualizada: Lectura = normalizarLectura({
          ...lectura,
          codigoMedidor: codigo,
          estadoSync: "pendiente",
          conflicto: null,
          intentoEn: null,
          actualizadoEn: new Date().toISOString(),
        });

        if (indice >= 0) lecturas[indice] = actualizada;
        else lecturas.push(actualizada);

        await escribirLecturas(lecturas);
        return actualizada;
      });
    },

    async actualizarLectura(
      idLocal: string,
      cambio: Partial<Lectura> | ((actual: Lectura) => Lectura),
    ) {
      return exclusivo(async () => {
        const lecturas = await leerLecturas();
        const indice = lecturas.findIndex((item) => item.idLocal === idLocal);
        if (indice < 0) throw new Error("La lectura local no existe.");

        const actual = lecturas[indice];
        const siguiente =
          typeof cambio === "function"
            ? cambio(actual)
            : { ...actual, ...cambio };
        lecturas[indice] = normalizarLectura({
          ...siguiente,
          actualizadoEn: new Date().toISOString(),
        });
        await escribirLecturas(lecturas);
        return lecturas[indice];
      });
    },

    async reemplazarLecturas(lecturas: Lectura[]) {
      return exclusivo(() => escribirLecturas(lecturas.map(normalizarLectura)));
    },

    async guardarBorrador(tecnico: string, borrador: Borrador) {
      return exclusivo(() =>
        adaptador.setItem(
          claveBorrador(tecnico),
          JSON.stringify({
            ...borrador,
            tecnico,
            actualizadoEn: new Date().toISOString(),
          }),
        ),
      );
    },

    async obtenerBorrador(tecnico: string): Promise<Borrador | null> {
      await cola;
      const propio = await adaptador.getItem(claveBorrador(tecnico));
      if (propio) return JSON.parse(propio);

      const anterior = await adaptador.getItem(BORRADOR_ANTERIOR);
      if (!anterior) return null;
      const borrador: Borrador = JSON.parse(anterior);
      return borrador.tecnico && borrador.tecnico !== tecnico ? null : borrador;
    },

    async borrarBorrador(tecnico: string) {
      return exclusivo(async () => {
        await adaptador.removeItem(claveBorrador(tecnico));
        const anterior = await adaptador.getItem(BORRADOR_ANTERIOR);
        if (anterior) {
          const borrador: Borrador = JSON.parse(anterior);
          if (!borrador.tecnico || borrador.tecnico === tecnico) {
            await adaptador.removeItem(BORRADOR_ANTERIOR);
          }
        }
      });
    },
  };
}

export type RepositorioLocal = ReturnType<typeof crearRepositorioLocal>;
