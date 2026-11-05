import assert from "node:assert/strict";
import test from "node:test";

import { crearRepositorioLocal } from "../src/storage/repository";
import { lecturaBase, Memoria } from "./helpers";

test("impide duplicados locales por medidor y mes", async () => {
  const repositorio = crearRepositorioLocal(new Memoria());
  await repositorio.guardarLectura(lecturaBase());
  await assert.rejects(
    repositorio.guardarLectura(lecturaBase({ idLocal: "local-2" })),
    /ya tiene registro este mes/,
  );
});

test("exige coordenadas válidas al guardar una lectura", async () => {
  const repositorio = crearRepositorioLocal(new Memoria());
  await assert.rejects(
    repositorio.guardarLectura(lecturaBase({ ubicacion: null })),
    /ubicación es obligatoria/,
  );
  await assert.rejects(
    repositorio.guardarLectura(
      lecturaBase({ ubicacion: { latitude: 91, longitude: 0 } }),
    ),
    /ubicación es obligatoria/,
  );
});

test("permite editar una pendiente y bloquea una enviada", async () => {
  const repositorio = crearRepositorioLocal(new Memoria());
  await repositorio.guardarLectura(lecturaBase());
  const editada = await repositorio.guardarLectura(
    lecturaBase({ lecturaActual: 115, consumo: 15 }),
  );
  assert.equal(editada.lecturaActual, 115);

  await repositorio.actualizarLectura("local-1", { estadoSync: "enviado" });
  await assert.rejects(
    repositorio.guardarLectura(lecturaBase({ lecturaActual: 120 })),
    /no se puede editar/,
  );
});

test("serializa guardados concurrentes y conserva una sola clave natural", async () => {
  const repositorio = crearRepositorioLocal(new Memoria());
  const resultados = await Promise.allSettled([
    repositorio.guardarLectura(lecturaBase({ idLocal: "a" })),
    repositorio.guardarLectura(lecturaBase({ idLocal: "b" })),
  ]);
  assert.equal(resultados.filter((item) => item.status === "fulfilled").length, 1);
  assert.equal(resultados.filter((item) => item.status === "rejected").length, 1);
});

test("separa y descarta borradores por técnico", async () => {
  const repositorio = crearRepositorioLocal(new Memoria());
  const borrador = {
    codigo: "MED-123456",
    estado: "normal" as const,
    lectura: "110",
    motivo: "",
    descripcion: "",
    confirmado: false,
    fotoUri: null,
  };
  await repositorio.guardarBorrador("TEC001", borrador);
  assert.equal((await repositorio.obtenerBorrador("TEC001"))?.lectura, "110");
  assert.equal(await repositorio.obtenerBorrador("TEC002"), null);
  await repositorio.borrarBorrador("TEC001");
  assert.equal(await repositorio.obtenerBorrador("TEC001"), null);
});

test("recupera como incierto un envío interrumpido al reiniciar", async () => {
  const repositorio = crearRepositorioLocal(new Memoria());
  await repositorio.guardarLectura(lecturaBase());
  await repositorio.actualizarLectura("local-1", { estadoSync: "enviando" });
  const recuperadas = await repositorio.recuperarEnviosInterrumpidos();
  assert.equal(recuperadas[0].estadoSync, "incierto");
});

test("conserva coordenadas sin conexión y normaliza lecturas antiguas", async () => {
  const memoria = new Memoria();
  const repositorio = crearRepositorioLocal(memoria);
  await repositorio.guardarLectura(
    lecturaBase({ ubicacion: { latitude: -0.18, longitude: -78.47 } }),
  );

  const conUbicacion = await repositorio.obtenerLecturas();
  assert.deepEqual(conUbicacion[0].ubicacion, {
    latitude: -0.18,
    longitude: -78.47,
  });

  const lecturaAnterior = lecturaBase();
  delete lecturaAnterior.ubicacion;
  memoria.datos.set("aqua_lecturas", JSON.stringify([lecturaAnterior]));
  const anterior = await repositorio.obtenerLecturas();
  assert.equal(anterior[0].ubicacion, null);

  memoria.datos.set(
    "aqua_lecturas",
    JSON.stringify([lecturaBase({ ubicacion: { latitude: 100, longitude: 0 } })]),
  );
  const invalida = await repositorio.obtenerLecturas();
  assert.equal(invalida[0].ubicacion, null);
});
