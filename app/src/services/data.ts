import { Dtc, Station, SystemStatus, Vehicle, Refuel } from '../types';

export const USER = { name: 'Jailson Costa', phone: '(00) 0000-0000', email: 'jailsoncosta@gmail.com' };

export const VEHICLE: Vehicle = {
  model: 'Honda Civic',
  year: 2019,
  plate: 'ABC1D23',
  fuelType: 'Flex (gasolina e etanol)',
  tankCapacity: 47,
};

/** Dicionário de códigos OBD-II em linguagem simples. */
export const DTC_DB: Record<string, Dtc> = {
  P0301: {
    code: 'P0301',
    title: 'Falha de ignição no cilindro 1',
    system: 'motor',
    severity: 'critico',
    meaning: 'O cilindro 1 não está queimando o combustível direito. O motor funciona, mas perde força e gasta mais.',
    action: 'Leve ao mecânico logo. Rodar muito tempo assim pode danificar o catalisador. Velas e bobina são os suspeitos mais comuns.',
  },
  P0420: {
    code: 'P0420',
    title: 'Eficiência do catalisador abaixo do limite (banco 1)',
    system: 'motor',
    severity: 'atencao',
    meaning: 'O catalisador não está limpando os gases do escapamento como deveria.',
    action: 'Não é urgente, mas mostre ao mecânico. Às vezes é consequência de outro problema, como a falha de ignição.',
  },
  P0171: {
    code: 'P0171',
    title: 'Mistura ar-combustível pobre (banco 1)',
    system: 'combustivel',
    severity: 'atencao',
    meaning: 'Está entrando ar demais ou combustível de menos no motor.',
    action: 'Pode ser entrada falsa de ar, bico injetor sujo ou sensor de fluxo de ar. Ainda dentro do aceitável, mas acompanhe.',
  },
  P0128: {
    code: 'P0128',
    title: 'Temperatura do líquido abaixo da esperada',
    system: 'refrigeracao',
    severity: 'atencao',
    meaning: 'O motor demora mais do que o normal para chegar à temperatura de trabalho.',
    action: 'Geralmente é a válvula termostática presa aberta. Vale mostrar ao mecânico.',
  },
};

function curve(from: number, to: number, n = 30, k = 4): number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return +(from + (to - from) * (1 - Math.exp(-k * t))).toFixed(1);
  });
}

export const SYSTEMS: SystemStatus[] = [
  {
    id: 'motor',
    name: 'Motor',
    score: 45,
    summary: 'Falha de ignição no cilindro 1',
    explanation: 'O motor funciona, mas um cilindro está falhando. Isso tira força e aumenta o consumo.',
    solution: 'Peça ao mecânico para checar velas, cabos e a bobina do cilindro 1. Resolver isso cedo evita estragar o catalisador.',
    sensorLabel: 'Rotação em marcha lenta (rpm)',
    series: Array.from({ length: 30 }, (_, i) => 780 + Math.round(Math.sin(i * 1.7) * 60 + (i % 5 === 0 ? -90 : 0))),
  },
  {
    id: 'eletrico',
    name: 'Elétrico',
    score: 90,
    summary: 'Bateria e alternador ok',
    explanation: 'Bateria e alternador dentro do esperado. Com o motor ligado, a tensão fica perto de 14 V.',
    solution: 'Nada a fazer agora. Só fique de olho se a partida começar a demorar.',
    sensorLabel: 'Tensão da bateria (V)',
    series: Array.from({ length: 30 }, (_, i) => +(13.9 + Math.sin(i) * 0.1).toFixed(2)),
  },
  {
    id: 'refrigeracao',
    name: 'Refrigeração',
    score: 50,
    summary: 'Motor demora para aquecer',
    explanation: 'O motor demora para aquecer. Pode ser a válvula termostática. Vale mostrar ao mecânico.',
    solution: 'A troca da válvula termostática costuma resolver. É um reparo simples e barato na maioria dos carros.',
    sensorLabel: 'Líquido de arrefecimento (°C)',
    series: curve(15.5, 98.6),
  },
  {
    id: 'combustivel',
    name: 'Combustível',
    score: 82,
    summary: 'Mistura levemente pobre',
    explanation: 'Mistura levemente pobre no banco 1. Ainda dentro do aceitável, mas acompanhe.',
    solution: 'Se o consumo subir, peça para verificar entrada falsa de ar e limpeza dos bicos injetores.',
    sensorLabel: 'Correção de combustível de longo prazo (%)',
    series: Array.from({ length: 30 }, (_, i) => +(6 + i * 0.08 + Math.sin(i) * 0.6).toFixed(1)),
  },
];

export const STATIONS: Station[] = [
  { id: 's1', name: 'Posto X Tunner Gas', address: 'Rua da Alegria, 123', x: 0.2, y: 0.25 },
  { id: 's2', name: 'Auto Posto Raposo', address: 'Av. Raposo Tavares, 1200', x: 0.4, y: 0.47 },
  { id: 's3', name: 'Posto Rio das Pedras', address: 'Av. Rio das Pedras, 200', x: 0.69, y: 0.15 },
  { id: 's4', name: 'Posto Vergueiro', address: 'Rua Vergueiro, 980', x: 0.79, y: 0.63 },
  { id: 's5', name: 'Posto Paulista', address: 'Av. Paulista, 2100', x: 0.39, y: 0.78 },
];

export const INITIAL_REFUELS: Refuel[] = [
  { id: 'r3', stationId: 's3', date: '2026-11-09T19:02:00', fuel: 'Gasolina comum', liters: 20, litersRead: 19.2, status: 'ok' },
  { id: 'r2', stationId: 's2', date: '2026-10-29T18:02:00', fuel: 'Etanol', liters: 25, litersRead: 24.4, status: 'ok' },
  { id: 'r1', stationId: 's1', date: '2026-10-21T16:02:00', fuel: 'Etanol', liters: 25, litersRead: 24.9, status: 'ok' },
];
