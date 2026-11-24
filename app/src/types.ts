export type SystemId = 'motor' | 'eletrico' | 'refrigeracao' | 'combustivel';
export type Severity = 'critico' | 'atencao';
export type FuelType = 'Gasolina comum' | 'Gasolina aditivada' | 'Etanol';

export interface Dtc {
  code: string;
  title: string;
  system: SystemId;
  severity: Severity;
  meaning: string;
  action: string;
}

export interface SystemStatus {
  id: SystemId;
  name: string;
  score: number;
  summary: string;
  explanation: string;
  solution: string;
  sensorLabel: string;
  /** Leituras dos últimos 60 min, da mais antiga para a mais recente */
  series: number[];
}

export interface Station {
  id: string;
  name: string;
  address: string;
  /** Posição no mapa ilustrativo (0–1) */
  x: number;
  y: number;
}

export type RefuelStatus = 'ok' | 'abaixo' | 'inconclusivo';

export interface Refuel {
  id: string;
  stationId: string;
  date: string; // ISO
  fuel: FuelType;
  liters: number;
  litersRead: number;
  status: RefuelStatus;
}

export interface Vehicle {
  model: string;
  year: number;
  plate: string;
  fuelType: string;
  tankCapacity: number;
}

export interface Report {
  id: string;
  createdAt: string; // ISO
  text: string;
}
