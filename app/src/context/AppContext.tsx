import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { INITIAL_REFUELS, SYSTEMS, VEHICLE } from '../services/data';
import { buildReport, classifyRefuel, lookupDtcs } from '../services/diagnostics';
import { mockObd, obd } from '../services/obd';
import { Dtc, FuelType, Refuel, Report, SystemStatus } from '../types';

type SettingKey = 'notifications' | 'alerts';

interface AppState {
  connected: boolean;
  connect: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  dtcs: Dtc[];
  systems: SystemStatus[];
  fuelLiters: number;
  refuels: Refuel[];
  registerRefuel: (p: { liters: number; stationId: string; fuel: FuelType }) => Promise<Refuel>;
  reports: Report[];
  generateReport: () => Report;
  settings: Record<SettingKey, boolean>;
  setSetting: (k: SettingKey, v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  // Códigos da última leitura ficam visíveis mesmo desconectado, como no protótipo
  const [dtcs, setDtcs] = useState<Dtc[]>(() => lookupDtcs(['P0301', 'P0420', 'P0171', 'P0128']));
  const [fuelLiters, setFuelLiters] = useState(26);
  const [refuels, setRefuels] = useState<Refuel[]>(INITIAL_REFUELS);
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({ notifications: true, alerts: true });

  const connect = useCallback(async (deviceId: string) => {
    await obd.connect(deviceId);
    setConnected(true);
    setDtcs(lookupDtcs(await obd.readDtcs()));
    const pct = await obd.readFuelLevelPercent();
    setFuelLiters(Math.round((pct / 100) * VEHICLE.tankCapacity));
  }, []);

  const disconnect = useCallback(async () => {
    await obd.disconnect();
    setConnected(false);
  }, []);

  const registerRefuel = useCallback(async ({ liters, stationId, fuel }: { liters: number; stationId: string; fuel: FuelType }) => {
    const cap = VEHICLE.tankCapacity;
    const before = ((await obd.readFuelLevelPercent()) / 100) * cap;
    mockObd.simulateRefuel(liters, cap); // remover quando houver adaptador real
    const after = ((await obd.readFuelLevelPercent()) / 100) * cap;
    const read = +(after - before).toFixed(1);
    const r: Refuel = {
      id: String(Date.now()),
      stationId,
      fuel,
      liters,
      litersRead: read,
      date: new Date().toISOString(),
      status: classifyRefuel(liters, read, cap - before),
    };
    setFuelLiters(Math.round(after));
    setRefuels((prev) => [r, ...prev]);
    return r;
  }, []);

  const generateReport = useCallback(() => {
    const now = new Date();
    const r: Report = { id: String(now.getTime()), createdAt: now.toISOString(), text: buildReport(SYSTEMS, dtcs, now) };
    setReports((prev) => [r, ...prev]);
    return r;
  }, [dtcs]);

  const setSetting = useCallback((k: SettingKey, v: boolean) => setSettings((s) => ({ ...s, [k]: v })), []);

  const value = useMemo<AppState>(
    () => ({
      connected,
      connect,
      disconnect,
      dtcs,
      systems: SYSTEMS,
      fuelLiters,
      refuels,
      registerRefuel,
      reports,
      generateReport,
      settings,
      setSetting,
    }),
    [connected, connect, disconnect, dtcs, fuelLiters, refuels, registerRefuel, reports, generateReport, settings, setSetting],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp precisa estar dentro de AppProvider');
  return v;
}
