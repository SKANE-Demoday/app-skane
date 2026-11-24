import { DTC_DB, VEHICLE } from './data';
import { Dtc, RefuelStatus, SystemStatus } from '../types';

export const FUEL_MARGIN_L = 2;

export function healthScore(systems: SystemStatus[]) {
  return Math.round(systems.reduce((s, x) => s + x.score, 0) / systems.length);
}

export function lookupDtcs(codes: string[]): Dtc[] {
  const order = { critico: 0, atencao: 1 } as const;
  return codes
    .map(
      (c): Dtc =>
        DTC_DB[c] ?? {
          code: c,
          title: 'Código não catalogado',
          system: 'motor',
          severity: 'atencao',
          meaning: 'Este código ainda não está no dicionário do app.',
          action: 'Mostre o código ao mecânico.',
        },
    )
    .sort((a, b) => order[a.severity] - order[b.severity]);
}

/**
 * Compara litros pagos com o que o sensor viu subir no tanque.
 * Se o pedido não cabia no tanque, a leitura não prova nada.
 */
export function classifyRefuel(liters: number, read: number, spaceBefore: number): RefuelStatus {
  if (liters > spaceBefore + FUEL_MARGIN_L) return 'inconclusivo';
  return read >= liters - FUEL_MARGIN_L ? 'ok' : 'abaixo';
}

export function fmtDate(d: Date) {
  const m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][d.getMonth()];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${m} · ${hh}:${mm}`;
}

export function buildReport(systems: SystemStatus[], dtcs: Dtc[], now = new Date()) {
  const sys = systems
    .map((s) => {
      const label = s.score >= 80 ? 'Ótimo' : s.score >= 60 ? 'Regular' : 'Atenção';
      return `• ${s.name}: ${s.score}% (${label}). ${s.explanation}`;
    })
    .join('\n');
  const codes = dtcs.map((d) => `• ${d.code}: ${d.title}`).join('\n');
  return [
    'RELATÓRIO DE DIAGNÓSTICO OBD-II · SKANE',
    `Gerado em ${fmtDate(now)}`,
    '',
    'VEÍCULO',
    `${VEHICLE.model} ${VEHICLE.year} · placa ${VEHICLE.plate} · ${VEHICLE.fuelType}`,
    '',
    'SISTEMAS',
    sys,
    '',
    'CÓDIGOS DE ERRO',
    codes || '• Nenhum código registrado',
    '',
    'Relatório informativo. Não substitui a avaliação de um profissional.',
  ].join('\n');
}
