import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, styles as ui } from '../components/ui';
import { useApp } from '../context/AppContext';
import { USER, VEHICLE } from '../services/data';
import { colors, radius } from '../theme';

export default function ProfileScreen() {
  const { settings, setSetting, connected, disconnect } = useApp();
  const initials = USER.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  const toggle = (label: string, value: boolean, onChange?: (v: boolean) => void) => (
    <View style={[ui.row, { justifyContent: 'space-between', paddingVertical: 4 }]}>
      <Text style={{ color: onChange ? colors.text : colors.muted }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={!onChange}
        trackColor={{ true: colors.blue, false: colors.border }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <Screen title="Perfil">
      <View style={{ alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <View style={s.avatar}>
          <Text style={{ color: '#FFF', fontSize: 30, fontWeight: '700' }}>{initials}</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 6 }}>{USER.name}</Text>
        <Text style={ui.muted}>{USER.phone}</Text>
        <Text style={ui.muted}>{USER.email}</Text>
      </View>

      <Pressable onPress={() => Alert.alert('Meu veículo', `${VEHICLE.model} ${VEHICLE.year}\nPlaca ${VEHICLE.plate}\nTanque de ${VEHICLE.tankCapacity} L`)}>
        <Card style={[ui.row, { justifyContent: 'space-between' }]}>
          <View>
            <Text style={{ fontWeight: '700', color: colors.text }}>Meu veículo</Text>
            <Text style={ui.muted}>
              {VEHICLE.model} · {VEHICLE.plate}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Card>
      </Pressable>

      <Card>
        {toggle('Notificações', settings.notifications, (v) => setSetting('notifications', v))}
        {toggle('Alertas na tela', settings.alerts, (v) => setSetting('alerts', v))}
        {toggle('Tema escuro', false)}
        <Text style={ui.muted}>Tema escuro chega numa próxima versão.</Text>
      </Card>

      <View style={s.premium}>
        <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 10 }]}>
          <Text style={s.premiumTitle}>SKANE Premium</Text>
          <Text style={s.premiumTitle}>R$ 9,90/mês</Text>
        </View>
        {['Histórico ilimitado na nuvem', 'Relatórios de gastos', 'Histórico completo de leituras'].map((b) => (
          <View key={b} style={[ui.row, { gap: 8, marginBottom: 6 }]}>
            <Ionicons name="checkmark" size={16} color="#FFF" />
            <Text style={{ color: '#FFF' }}>{b}</Text>
          </View>
        ))}
        <Pressable style={s.manage} onPress={() => Alert.alert('SKANE Premium', 'A assinatura ainda não está disponível nesta versão.')}>
          <Text style={{ color: colors.navy, fontWeight: '700' }}>Gerenciar assinatura</Text>
        </Pressable>
      </View>

      {connected && (
        <Pressable onPress={disconnect} style={{ alignItems: 'center', padding: 8 }}>
          <Text style={{ color: colors.navy, fontWeight: '600' }}>Desconectar adaptador</Text>
        </Pressable>
      )}
      <Pressable onPress={() => Alert.alert('Sair da conta', 'Login ainda não implementado nesta versão.')} style={{ alignItems: 'center', padding: 8 }}>
        <Text style={{ color: colors.red, fontWeight: '600' }}>Sair da conta</Text>
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  premium: { backgroundColor: colors.navy, borderRadius: radius.lg, padding: 18 },
  premiumTitle: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  manage: { backgroundColor: '#FFF', borderRadius: radius.pill, height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
});
