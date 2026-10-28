import assert from "node:assert/strict";
import test from "node:test";

import { crearSincronizador } from "../src/services/syncCore";
import type { Lectura, Medidor } from "../src/types/models";
import { lecturaBase, medidorBase } from "./helpers";

function escenario(inicial: Lectura[], opciones: {
  remotas?: Lectura[];
  medidor?: Medidor | null;
  errorPost?: Error;
} = {}) {
  let lecturas = inicial.map((item) => ({ ...item }));
  let posts = 0;
  const sincronizar = crearSincronizador({
    obtenerLecturas: async () => lecturas.map((item) => ({ ...item })),
    actualizarLectura: async (id, cambio) => {
      const indice = lecturas.findIndex((item) => item.idLocal === id);
      const actual = lecturas[indice];
      lecturas[indice] = typeof cambio === "function"
        ? cambio(actual)
        : { ...actual, ...cambio };
      return { ...lecturas[indice] };
    },
    obtenerMedidores: async () => ({}),
    guardarMedidor: async () => undefined,
    obtenerMedidor: async () => opciones.medidor ?? null,
    obtenerLecturasRemotas: async () => opciones.remotas ?? [],
    enviarLectura: async (lectura) => {
      posts++;
      if (opciones.errorPost) throw opciones.errorPost;
      return { ...lectura, estadoSync: "enviado", id: "remoto-1" };
    },
  });
  return {
    sincronizar,
    get lecturas() { return lecturas; },
    get posts() { return posts; },
  };
}

test("confirma un envío incierto existente sin repetir POST", async () => {
  const local = lecturaBase({ estadoSync: "incierto" });
  const prueba = escenario([local], { remotas: [{ ...local, estadoSync: "enviado" }] });
  const resultado = await prueba.sincronizar();
  assert.equal(prueba.posts, 0);
  assert.equal(prueba.lecturas[0].estadoSync, "enviado");
  assert.equal(resultado.enviados, 1);
});

test("marca conflicto si el mismo id remoto contiene datos diferentes", async () => {
  const local = lecturaBase({ estadoSync: "incierto" });
  const remota = lecturaBase({ lecturaActual: 999, estadoSync: "enviado" });
  const prueba = escenario([local], { remotas: [remota] });
  await prueba.sincronizar();
  assert.equal(prueba.posts, 0);
  assert.equal(prueba.lecturas[0].estadoSync, "conflicto");
  assert.equal(prueba.lecturas[0].conflicto?.tipo, "respuesta_divergente");
});

test("deja incierto un POST con error de red", async () => {
  const prueba = escenario([lecturaBase()], { errorPost: new Error("red interrumpida") });
  const resultado = await prueba.sincronizar();
  assert.equal(prueba.posts, 1);
  assert.equal(prueba.lecturas[0].estadoSync, "incierto");
  assert.equal(resultado.inciertos, 1);
});

test("trata HTTP 429 como incierto y no como datos inválidos", async () => {
  const error = Object.assign(new Error("Demasiadas solicitudes"), { status: 429 });
  const prueba = escenario([lecturaBase()], { errorPost: error });
  await prueba.sincronizar();
  assert.equal(prueba.lecturas[0].estadoSync, "incierto");
  assert.equal(prueba.lecturas[0].conflicto, null);
});

test("no reintenta un envío incierto ausente en el mismo ciclo", async () => {
  const prueba = escenario([lecturaBase({ estadoSync: "incierto" })]);
  await prueba.sincronizar();
  assert.equal(prueba.posts, 0);
  assert.equal(prueba.lecturas[0].estadoSync, "pendiente");
});

test("convierte anomalía descubierta al reconectar en revisión visible", async () => {
  const prueba = escenario([
    lecturaBase({
      lecturaActual: 150,
      consumo: null,
      pendienteVerificacion: true,
    }),
  ], { medidor: medidorBase });
  const resultado = await prueba.sincronizar();
  assert.equal(prueba.posts, 0);
  assert.equal(prueba.lecturas[0].estadoSync, "conflicto");
  assert.equal(prueba.lecturas[0].conflicto?.tipo, "anomalia_reconexion");
  assert.equal(resultado.verificacion, 1);
});

test("detiene duplicado remoto de medidor y mes", async () => {
  const remota = lecturaBase({ idLocal: "otro-id", estadoSync: "enviado" });
  const prueba = escenario([lecturaBase()], { remotas: [remota] });
  await prueba.sincronizar();
  assert.equal(prueba.posts, 0);
  assert.equal(prueba.lecturas[0].conflicto?.tipo, "duplicado_remoto");
});

test("persiste enviando antes de invocar POST y bloquea sincronizaciones paralelas", async () => {
  let estadoDurantePost: string | undefined;
  let lecturas = [lecturaBase()];
  let liberar: (() => void) | undefined;
  const espera = new Promise<void>((resolve) => { liberar = resolve; });
  const sincronizar = crearSincronizador({
    obtenerLecturas: async () => lecturas,
    actualizarLectura: async (id, cambio) => {
      const actual = lecturas[0];
      lecturas[0] = typeof cambio === "function" ? cambio(actual) : { ...actual, ...cambio };
      return lecturas[0];
    },
    obtenerMedidores: async () => ({}),
    guardarMedidor: async () => undefined,
    obtenerMedidor: async () => null,
    obtenerLecturasRemotas: async () => [],
    enviarLectura: async (lectura) => {
      estadoDurantePost = lecturas[0].estadoSync;
      await espera;
      return { ...lectura, estadoSync: "enviado" };
    },
  });
  const primera = sincronizar();
  await new Promise((resolve) => setTimeout(resolve, 0));
  const segunda = await sincronizar();
  liberar?.();
  await primera;
  assert.equal(estadoDurantePost, "enviando");
  assert.deepEqual(segunda, { enviados: 0, verificacion: 0, conflictos: 0, inciertos: 0, errores: 0 });
});
