
export type EstadoMedidor = "normal" | "inaccesible" | "dañado";
export type EstadoSync = "pendiente" | "enviado";

export interface Medidor {
  id: string;
  codigo: string;
  direccion: string;
  sector: string;
  numeroCuenta: string;
  estado: string;
  ultimaLectura: number;
  fechaUltimaLectura: string;
  promedioMensual: number;
}

export interface Lectura {
  idLocal: string;
  codigoMedidor: string;
  tecnico: string;
  fecha: string;
  mes: string;
  estadoMedidor: EstadoMedidor;
  lecturaActual: number | null;
  consumo: number | null;
  motivo: string;
  descripcionDanio: string;
  confirmacionAnomalia: boolean;
  fotoUri: string | null;
  estadoSync: EstadoSync;
  pendienteVerificacion: boolean;
}

export interface Borrador {
  codigo: string;
  estado: EstadoMedidor;
  lectura: string;
  motivo: string;
  descripcion: string;
  confirmado: boolean;
  fotoUri: string | null;
}
