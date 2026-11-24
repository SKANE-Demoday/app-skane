import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Badge, Button, Card, Screen, styles as ui } from '../components/ui';
import { LineChart } from '../components/graphics';
import { useApp } from '../context/AppContext';
import { RootStackParamList, useNav } from '../navigation/types';
import { healthScore } from '../services/diagnostics';
import { colors, radius, scoreTone } from '../theme';
import { Dtc, SystemId } from '../types';

const ICONS: Record<SystemId, keyof typeof MaterialCommunityIcons.glyphMap> = {
  motor: 'engine',
  eletrico: 'car-battery',
  refrigeracao: 'coolant-temperature',
  combustivel: 'gas-station',
};

export function DiagnosticScreen() {
  const nav = useNav();
  const { systems, dtcs } = useApp();
  const score = healthScore(systems);
  const tone = scoreTone(score);
  const critical = dtcs.filter((d) => d.severity === 'critico').length;

  return (
    <Screen title="Diagnóstico">
      <Card>
        <Text style={{ color: colors.text }}>Saúde do veículo</Text>
        <View style={[ui.row, { alignItems: 'baseline', marginVertical: 6 }]}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: tone.color }}>{score}%</Text>
          <Text style={{ marginLeft: 8, color: tone.color, fontWeight: '600' }}>{tone.label}</Text>
        </View>
        <View style={s.track}>
          <View style={[s.fill, { width: `${score}%`, backgroundColor: tone.color }]} />
        </View>
        <Text style={[ui.muted, { marginTop: 6 }]}>Média dos sistemas abaixo.</Text>
      </Card>

      <View style={s.grid}>
        {systems.map((sys) => {
          const t = scoreTone(sys.score);
          return (
            <Pressable key={sys.id} style={s.tile} onPress={() => nav.navigate('System', { id: sys.id })} accessibilityRole="button">
              <View style={s.iconWrap}>
                <MaterialCommunityIcons name={ICONS[sys.id]} size={20} color={colors.blue} />
              </View>
              <Text style={s.tileTitle}>{sys.name}</Text>
              <Text style={{ fontSize: 12, color: t.color }}>
                {sys.score}% · {t.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable style={s.tile} onPress={() => nav.navigate('Codes')} accessibilityRole="button">
          <View style={s.iconWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.blue} />
          </View>
          <Text style={s.tileTitle}>Códigos de erro</Text>
          <Text style={{ fontSize: 12, color: dtcs.length ? colors.red : colors.green }}>
            {dtcs.length} códigos · {critical} crítico{critical === 1 ? '' : 's'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function DtcRow({ d, expanded, onPress }: { d: Dtc; expanded?: boolean; onPress?: () => void }) {
  const badge =
    d.severity === 'critico'
      ? { label: 'Crítico', color: colors.red, soft: colors.redSoft }
      : { label: 'Atenção', color: colors.amber, soft: colors.amberSoft };
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 10 }}>
      <View style={[ui.row, { gap: 12 }]}>
        <Text style={{ fontWeight: '800', color: colors.text, width: 52 }}>{d.code}</Text>
        <Text style={{ flex: 1, fontSize: 13, color: colors.text }}>{d.title}</Text>
        <Badge {...badge} />
      </View>
      {expanded && (
        <View style={{ marginTop: 10, gap: 6 }}>
          <Text style={s.label}>O que significa</Text>
          <Text style={s.body}>{d.meaning}</Text>
          <Text style={s.label}>O que fazer</Text>
          <Text style={s.body}>{d.action}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function SystemScreen() {
  const nav = useNav();
  const { params } = useRoute<RouteProp<RootStackParamList, 'System'>>();
  const { systems, dtcs } = useApp();
  const sys = systems.find((x) => x.id === params.id)!;
  const codes = dtcs.filter((d) => d.system === sys.id);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Screen
      title={sys.name}
      back
      footer={
        <>
          <Button label={showSolution ? 'Ocultar solução' : 'Ver possível solução'} variant="navy" onPress={() => setShowSolution((v) => !v)} />
          <Button label="Gerar relatório" variant="outline" onPress={() => nav.navigate('Report')} />
        </>
      }
    >
      <Card>
        <LineChart data={sys.series} />
        <View style={[ui.row, { marginTop: 8 }]}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue, marginRight: 6 }} />
          <Text style={ui.muted}>{sys.sensorLabel}</Text>
        </View>
      </Card>
      <Card>
        <Text style={[ui.sectionTitle, { marginBottom: 6 }]}>O que está acontecendo</Text>
        <Text style={s.body}>{sys.explanation}</Text>
        {showSolution && (
          <View style={s.solution}>
            <Text style={[s.label, { color: colors.blue }]}>Possível solução</Text>
            <Text style={s.body}>{sys.solution}</Text>
          </View>
        )}
      </Card>
      <Card>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={ui.sectionTitle}>Códigos de erro</Text>
          <Pressable onPress={() => nav.navigate('Codes')}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>Ver todos</Text>
          </Pressable>
        </View>
        {codes.length ? (
          codes.map((d) => <DtcRow key={d.code} d={d} onPress={() => nav.navigate('Codes', { focus: d.code })} />)
        ) : (
          <Text style={[ui.muted, { marginTop: 8 }]}>Nenhum código neste sistema.</Text>
        )}
      </Card>
    </Screen>
  );
}

export function CodesScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Codes'>>();
  const { dtcs } = useApp();
  const [open, setOpen] = useState<string | undefined>(params?.focus);
  return (
    <Screen title="Códigos de erro" back>
      <Card>
        {dtcs.map((d, i) => (
          <View key={d.code}>
            {i > 0 && <View style={ui.divider} />}
            <DtcRow d={d} expanded={open === d.code} onPress={() => setOpen(open === d.code ? undefined : d.code)} />
          </View>
        ))}
      </Card>
      <Text style={[ui.muted, { textAlign: 'center' }]}>Toque em um código para ver o que significa e o que fazer.</Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48.5%', backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, gap: 4 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tileTitle: { fontWeight: '700', color: colors.text },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  solution: { marginTop: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.blueSoft, gap: 4 },
});
