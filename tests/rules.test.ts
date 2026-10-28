import assert from "node:assert/strict";
import test from "node:test";

import {
  calcularConsumo,
  esAnomalo,
  validarCodigo,
  validarRegistro,
} from "../src/utils/rules";

test("acepta únicamente MED- seguido de seis dígitos", () => {
  assert.equal(validarCodigo("MED-123456"), true);
  assert.equal(validarCodigo("med-123456"), false);
  assert.equal(validarCodigo("MED-12345"), false);
  assert.equal(validarCodigo("MED-1234567"), false);
});

test("calcula consumo y exige superar exactamente el triple", () => {
  assert.equal(calcularConsumo(160, 100), 60);
  assert.equal(esAnomalo(30, 10), false);
  assert.equal(esAnomalo(31, 10), true);
});

test("valida los campos obligatorios de cada estado", () => {
  assert.equal(validarRegistro("normal", "", "", ""), "La lectura es obligatoria.");
  assert.equal(validarRegistro("inaccesible", "", "", ""), "Debe indicar el motivo.");
  assert.equal(validarRegistro("dañado", "120", "", ""), "Debe describir el daño.");
  assert.equal(validarRegistro("normal", "120.5", "", ""), "La lectura debe ser un número entero válido.");
  assert.equal(validarRegistro("normal", "120", "", ""), null);
});
