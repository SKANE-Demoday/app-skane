import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Logo, Screen, styles as ui } from '../components/ui';
import { Dongle } from '../components/graphics';
import { useApp } from '../context/AppContext';
import { useNav } from '../navigation/types';
import { USER, VEHICLE } from '../services/data';
import { colors, radius } from '../theme';

const initials = (n: string) =>
  n
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function HomeScreen() {
  const nav = useNav();
  const { connected, dtcs } = useApp();
  const first = USER.name.split(' ')[0];

  const actions = [
    { label: 'Diagnóstico', icon: 'tools' as const, go: () => nav.navigate('Tabs', { screen: 'Diagnostico' }) },
    { label: 'Mapa de postos', icon: 'map-outline' as const, go: () => nav.navigate('Tabs', { screen: 'Postos' }) },
    { label: 'Relatório', icon: 'file-document-outline' as const, go: () => nav.navigate('Report') },
    { label: 'Histórico', icon: 'history' as const, go: () => nav.navigate('History') },
  ];

  return (
    <Screen>
      <View style={[ui.row, { justifyContent: 'space-between' }]}>
        <View style={ui.row}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials(USER.name)}</Text>
          </View>
          <Text style={s.hello}>Olá, {first}</Text>
        </View>
        <Logo />
      </View>

      <Pressable
        onPress={() => !connected && nav.navigate('Connect')}
        accessibilityRole="button"
        accessibilityLabel={connected ? 'Adaptador conectado' : 'Conectar adaptador'}
        style={[s.device, { backgroundColor: connected ? colors.blue : colors.offline }]}
      >
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <MaterialCommunityIcons name="access-point" size={20} color={connected ? '#FFF' : colors.muted} />
          <Text style={[s.obd, { color: connected ? '#FFF' : colors.muted }]}>OBD-II</Text>
        </View>
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <Dongle width={150} active={connected} />
        </View>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          {connected ? (
            <Text style={s.deviceName}>
              Dispositivo: <Text style={{ fontWeight: '700' }}>{`${VEHICLE.model} - ${VEHICLE.plate}`}</Text>
            </Text>
          ) : (
            <View style={ui.row}>
              <Ionicons name="bluetooth" size={16} color={colors.text} />
              <Text style={{ marginLeft: 4, color: colors.text }}>Conectar</Text>
            </View>
          )}
          <View style={ui.row}>
            <Text style={{ fontSize: 12, marginRight: 6, color: connected ? '#FFF' : colors.text }}>Status:</Text>
            <View style={[s.pill, { backgroundColor: connected ? '#FFF' : colors.navy }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: connected ? colors.blue : '#FFF' }}>
                {connected ? 'Conectado' : 'Desconectado'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      <View style={s.grid}>
        {actions.map((a) => (
          <Pressable key={a.label} onPress={a.go} style={s.action} accessibilityRole="button">
            <MaterialCommunityIcons name={a.icon} size={26} color={colors.blue} />
            <Text style={s.actionText}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <Text style={[ui.sectionTitle, { marginBottom: 8 }]}>Avisos do seu carro</Text>
        {dtcs.length === 0 ? (
          <Text style={ui.muted}>Nenhum aviso. Conecte o adaptador para fazer uma leitura.</Text>
        ) : (
          dtcs.slice(0, 2).map((d, i) => (
            <Pressable key={d.code} onPress={() => nav.navigate('Codes', { focus: d.code })}>
              {i > 0 && <View style={ui.divider} />}
              <View style={[ui.row, { paddingVertical: 12 }]}>
                <MaterialCommunityIcons
                  name="engine"
                  size={22}
                  color={d.severity === 'critico' ? colors.red : colors.amberIcon}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontWeight: '600', color: colors.text }}>
                    {d.code} · {d.title}
                  </Text>
                  <Text style={ui.muted}>Toque para ver o que significa e o que fazer.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </View>
            </Pressable>
          ))
        )}
        {dtcs.length > 2 && (
          <Pressable onPress={() => nav.navigate('Codes')}>
            <Text style={{ color: colors.blue, fontWeight: '600', marginTop: 4 }}>Ver todos os {dtcs.length} avisos</Text>
          </Pressable>
        )}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700' },
  hello: { marginLeft: 10, fontSize: 18, fontWeight: '600', color: colors.text },
  device: { borderRadius: radius.lg, padding: 16 },
  obd: { fontWeight: '700' },
  deviceName: { color: '#FFF', fontSize: 12, flexShrink: 1 },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  grid: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  actionText: { fontSize: 11, color: colors.text, textAlign: 'center' },
});
