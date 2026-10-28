
export type EstadoMedidor = "normal" | "inaccesible" | "dañado";
export type EstadoSync =
  | "pendiente"
  | "enviando"
  | "incierto"
  | "conflicto"
  | "enviado";

export type TipoConflicto =
  | "anomalia_reconexion"
  | "duplicado_remoto"
  | "medidor_no_encontrado"
  | "lectura_invalida"
  | "respuesta_divergente";

export interface ConflictoLectura {
  tipo: TipoConflicto;
  detalle: string;
  detectadoEn: string;
}

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
  conflicto?: ConflictoLectura | null;
  intentoEn?: string | null;
  enviadoEn?: string | null;
  idRemoto?: string | null;
  actualizadoEn?: string;
}

export interface Borrador {
  codigo: string;
  estado: EstadoMedidor;
  lectura: string;
  motivo: string;
  descripcion: string;
  confirmado: boolean;
  fotoUri: string | null;
  tecnico?: string;
  idLocal?: string | null;
  actualizadoEn?: string;
}
