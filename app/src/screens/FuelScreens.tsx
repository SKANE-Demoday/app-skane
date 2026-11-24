import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Button, Card, Chip, Screen, styles as ui } from '../components/ui';
import { FuelGauge } from '../components/graphics';
import { useApp } from '../context/AppContext';
import { useNav } from '../navigation/types';
import { STATIONS, VEHICLE } from '../services/data';
import { FUEL_MARGIN_L, fmtDate } from '../services/diagnostics';
import { colors, radius } from '../theme';
import { FuelType, Refuel, RefuelStatus } from '../types';

const STATUS: Record<RefuelStatus, { label: string; color: string }> = {
  ok: { label: 'Dentro da margem', color: colors.green },
  abaixo: { label: 'Abaixo do esperado', color: colors.red },
  inconclusivo: { label: 'Tanque encheu · sem conferência', color: colors.muted },
};

const stationName = (id: string) => STATIONS.find((s) => s.id === id)?.name ?? 'Posto';

/* ---------------- Postos ---------------- */

export function StationsScreen() {
  const { refuels } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const [w, setW] = useState(320);
  const h = 170;
  const count = (id: string) => refuels.filter((r) => r.stationId === id).length;

  return (
    <Screen title="Postos">
      <View style={s.map} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <Svg width={w} height={h}>
          <Rect width={w} height={h} fill="#E8ECF2" />
          {[0.12, 0.42, 0.72].map((y) => (
            <Line key={`h${y}`} x1={0} x2={w} y1={h * y} y2={h * y + 20} stroke="#FFF" strokeWidth={12} />
          ))}
          {[0.28, 0.55, 0.85].map((x) => (
            <Line key={`v${x}`} x1={w * x} x2={w * x - 18} y1={0} y2={h} stroke="#FFF" strokeWidth={12} />
          ))}
          <Rect x={w * 0.52} y={h * 0.78} width={42} height={30} rx={4} fill="#CFE3D2" />
          <Circle cx={w * 0.5} cy={h * 0.55} r={5} fill={colors.navy} />
          {STATIONS.map((st) => (
            <Circle
              key={st.id}
              cx={w * st.x}
              cy={h * st.y}
              r={sel === st.id ? 11 : 8}
              fill={colors.blue}
              stroke="#FFF"
              strokeWidth={2.5}
            />
          ))}
        </Svg>
        <Text style={s.mapNote}>Mapa ilustrativo</Text>
      </View>

      <Card style={{ paddingVertical: 8 }}>
        <Text style={[ui.sectionTitle, { marginVertical: 8 }]}>Postos perto de você</Text>
        {STATIONS.map((st, i) => {
          const n = count(st.id);
          return (
            <Pressable key={st.id} onPress={() => setSel(st.id)}>
              {i > 0 && <View style={ui.divider} />}
              <View style={[ui.row, { paddingVertical: 10, gap: 12 }]}>
                <View style={s.pumpIcon}>
                  <MaterialCommunityIcons name="gas-station" size={16} color={colors.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: sel === st.id ? '800' : '600', color: colors.text }}>{st.name}</Text>
                  <Text style={ui.muted}>{st.address}</Text>
                </View>
                {n > 0 && (
                  <Text style={ui.muted}>
                    {n} abastecimento{n > 1 ? 's' : ''} seu{n > 1 ? 's' : ''}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </Card>
      <Text style={[ui.muted, { paddingHorizontal: 4 }]}>Seus abastecimentos ficam visíveis só para você.</Text>
    </Screen>
  );
}

/* ---------------- Combustível ---------------- */

function RefuelRow({ r }: { r: Refuel }) {
  const st = STATUS[r.status];
  return (
    <View style={[ui.row, { paddingVertical: 12, alignItems: 'flex-start' }]}>
      <View style={[s.dot, { backgroundColor: st.color }]} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', color: colors.text }}>{stationName(r.stationId)}</Text>
        <Text style={ui.muted}>
          {fmtDate(new Date(r.date))} · {r.fuel}
        </Text>
        <Text style={{ fontSize: 12, color: st.color, marginTop: 2 }}>{st.label}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontWeight: '800', color: colors.blue }}>{r.liters.toFixed(1).replace('.', ',')} L</Text>
        <Text style={ui.muted}>≈ {r.litersRead.toFixed(1).replace('.', ',')} L lidos</Text>
      </View>
    </View>
  );
}

export function FuelScreen() {
  const nav = useNav();
  const { fuelLiters, refuels } = useApp();
  const [all, setAll] = useState(false);
  const list = all ? refuels : refuels.slice(0, 3);
  return (
    <Screen title="Combustível">
      <FuelGauge liters={fuelLiters} capacity={VEHICLE.tankCapacity} />
      <Text style={[ui.muted, { textAlign: 'center' }]}>Leitura do sensor do tanque, com margem de ±{FUEL_MARGIN_L} L.</Text>
      <Button label="Registrar abastecimento" icon="document-text" onPress={() => nav.navigate('Refuel')} />
      <Card>
        <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
          <Text style={ui.sectionTitle}>Histórico de abastecimento</Text>
          <Pressable onPress={() => setAll((v) => !v)}>
            <Text style={{ fontWeight: '600', color: colors.text }}>{all ? 'Ver menos' : 'Ver tudo'}</Text>
          </Pressable>
        </View>
        {list.map((r, i) => (
          <View key={r.id}>
            {i > 0 && <View style={ui.divider} />}
            <RefuelRow r={r} />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

/* ---------------- Abastecimento ---------------- */

const PRESETS = [10, 15, 20, 25, 30];
const FUELS: FuelType[] = ['Gasolina comum', 'Gasolina aditivada', 'Etanol'];

export function RefuelScreen() {
  const nav = useNav();
  const { fuelLiters, registerRefuel } = useApp();
  const [liters, setLiters] = useState(30);
  const [station, setStation] = useState(STATIONS[0].id);
  const [fuel, setFuel] = useState<FuelType>('Gasolina comum');
  const [busy, setBusy] = useState(false);
  const space = VEHICLE.tankCapacity - fuelLiters;
  const overflow = liters > space + FUEL_MARGIN_L;

  const confirm = async () => {
    setBusy(true);
    try {
      const r = await registerRefuel({ liters, stationId: station, fuel });
      const msg =
        r.status === 'ok'
          ? `O tanque subiu cerca de ${r.litersRead.toFixed(1)} L. Bate com o que você pagou.`
          : r.status === 'abaixo'
            ? `O tanque subiu cerca de ${r.litersRead.toFixed(1)} L, menos que os ${liters} L informados. Confira o valor na bomba e o comprovante.`
            : 'O tanque encheu antes do total informado, então não dá para conferir a bomba desta vez.';
      Alert.alert('Abastecimento registrado', msg, [{ text: 'Ok', onPress: () => nav.goBack() }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Abastecimento" back footer={<Button label="Confirmar" onPress={confirm} loading={busy} />}>
      <View style={[ui.row, { gap: 12 }]}>
        <View style={s.bigIcon}>
          <MaterialCommunityIcons name="gas-station" size={24} color={colors.navy} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.navy }}>Quantos litros você vai abastecer?</Text>
          <Text style={ui.muted}>Escolha ou ajuste a quantidade.</Text>
        </View>
      </View>

      <Card style={[ui.row, { justifyContent: 'space-between' }]}>
        <Pressable style={[s.step, { backgroundColor: colors.blueSoft }]} onPress={() => setLiters((v) => Math.max(1, v - 1))} accessibilityLabel="Menos um litro">
          <Ionicons name="remove" size={22} color={colors.navy} />
        </Pressable>
        <Text style={{ fontSize: 30, fontWeight: '900', color: colors.navy }}>
          {liters} <Text style={{ fontSize: 16 }}>L</Text>
        </Text>
        <Pressable style={[s.step, { backgroundColor: colors.navy }]} onPress={() => setLiters((v) => Math.min(80, v + 1))} accessibilityLabel="Mais um litro">
          <Ionicons name="add" size={22} color="#FFF" />
        </Pressable>
      </Card>
      <View style={s.wrap}>
        {PRESETS.map((p) => (
          <Chip key={p} label={`${p} L`} selected={liters === p} onPress={() => setLiters(p)} />
        ))}
      </View>
      {overflow && (
        <View style={[s.tip, { backgroundColor: colors.amberSoft }]}>
          <Ionicons name="warning-outline" size={18} color={colors.amber} />
          <Text style={[s.tipText, { color: colors.amber }]}>
            Cabem cerca de {Math.max(0, space)} L no tanque agora. Acima disso o app não consegue conferir a bomba.
          </Text>
        </View>
      )}

      <Text style={ui.sectionTitle}>Posto</Text>
      <View style={s.wrap}>
        {STATIONS.map((st) => (
          <Chip key={st.id} label={st.name} selected={station === st.id} onPress={() => setStation(st.id)} />
        ))}
      </View>

      <Text style={ui.sectionTitle}>Combustível</Text>
      <View style={s.wrap}>
        {FUELS.map((f) => (
          <Chip key={f} label={f} selected={fuel === f} onPress={() => setFuel(f)} />
        ))}
      </View>

      <View style={s.tip}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={colors.navy} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: colors.navy }}>Dica da SKANE</Text>
          <Text style={s.tipText}>
            Confirme antes de desligar o carro na bomba. Depois de abastecer, ligue o carro em local plano e espere alguns segundos: a leitura do tanque fica mais estável.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  map: { borderRadius: radius.lg, overflow: 'hidden' },
  mapNote: { position: 'absolute', right: 8, bottom: 6, fontSize: 10, color: colors.muted },
  pumpIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 10 },
  bigIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  step: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tip: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.blueSoft },
  tipText: { fontSize: 13, color: colors.text, lineHeight: 18, flex: 1 },
});
