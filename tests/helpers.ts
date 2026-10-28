import type { AlmacenamientoClaveValor } from "../src/storage/repository";
import type { Lectura, Medidor } from "../src/types/models";

export class Memoria implements AlmacenamientoClaveValor {
  datos = new Map<string, string>();

  async getItem(clave: string) {
    return this.datos.get(clave) ?? null;
  }

  async setItem(clave: string, valor: string) {
    this.datos.set(clave, valor);
  }

  async removeItem(clave: string) {
    this.datos.delete(clave);
  }
}

export const medidorBase: Medidor = {
  id: "1",
  codigo: "MED-123456",
  direccion: "Dirección de prueba",
  sector: "Sector de prueba",
  numeroCuenta: "CTA-1",
  estado: "activo",
  ultimaLectura: 100,
  fechaUltimaLectura: "2026-09-01",
  promedioMensual: 10,
};

export function lecturaBase(cambio: Partial<Lectura> = {}): Lectura {
  return {
    idLocal: "local-1",
    codigoMedidor: "MED-123456",
    tecnico: "TEC001",
    fecha: "2026-10-01T10:00:00.000Z",
    mes: "2026-10",
    estadoMedidor: "normal",
    lecturaActual: 110,
    consumo: 10,
    motivo: "",
    descripcionDanio: "",
    confirmacionAnomalia: false,
    fotoUri: null,
    estadoSync: "pendiente",
    pendienteVerificacion: false,
    conflicto: null,
    ...cambio,
  };
}
