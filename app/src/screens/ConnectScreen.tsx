import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, styles as ui } from '../components/ui';
import { Dongle } from '../components/graphics';
import { useApp } from '../context/AppContext';
import { useNav } from '../navigation/types';
import { VEHICLE } from '../services/data';
import { FoundDevice, obd } from '../services/obd';
import { colors } from '../theme';

export default function ConnectScreen() {
  const nav = useNav();
  const { connect } = useApp();
  const [found, setFound] = useState<FoundDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    const stop = obd.scan(setFound);
    return () => {
      loop.stop();
      stop();
    };
  }, [pulse]);

  const onConnect = async () => {
    if (!found) return;
    setBusy(true);
    try {
      await connect(found.id);
      nav.goBack();
    } catch {
      Alert.alert('Não foi possível conectar', 'Confira se o carro está ligado e o adaptador encaixado, e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <SafeAreaView style={[ui.safe, { padding: 20 }]}>
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12} accessibilityLabel="Fechar">
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
      </View>
      <Text style={s.title}>Conectar dispositivo</Text>

      <View style={s.radar}>
        {!found && <Animated.View style={[s.ring, { transform: [{ scale }], opacity }]} />}
        <View style={s.outer}>
          <View style={s.inner}>
            <Dongle width={140} />
          </View>
        </View>
      </View>

      {found ? (
        <Card style={[ui.row, { gap: 12 }]}>
          <View style={s.carIcon}>
            <Ionicons name="car" size={18} color={colors.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.text }}>{VEHICLE.model}</Text>
            <Text style={ui.muted}>
              {VEHICLE.year} · {VEHICLE.plate}
            </Text>
            <Text style={ui.muted}>Dispositivo OBD-II</Text>
          </View>
          <MaterialCommunityIcons name={`signal-cellular-${Math.min(3, found.signal)}` as 'signal-cellular-3'} size={18} color={colors.muted} />
        </Card>
      ) : null}
      <Text style={s.status}>{found ? 'Adaptador encontrado.' : 'Buscando dispositivos…'}</Text>

      <View style={{ flex: 1 }} />
      <Button label="Conectar agora" variant="navy" onPress={onConnect} disabled={!found} loading={busy} />
      <Pressable
        onPress={() =>
          Alert.alert(
            'Não encontrou o aparelho?',
            'Encaixe o adaptador na porta OBD-II (geralmente embaixo do volante), ligue a ignição e deixe o Bluetooth do celular ativo.',
          )
        }
        style={{ padding: 14, alignItems: 'center' }}
      >
        <Text style={{ color: colors.blue }}>Não encontrou o aparelho?</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  radar: { alignItems: 'center', justifyContent: 'center', height: 260, marginBottom: 12 },
  ring: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: colors.blue },
  outer: { width: 230, height: 230, borderRadius: 115, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#F2F6FD', alignItems: 'center', justifyContent: 'center' },
  carIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  status: { textAlign: 'center', color: colors.text, marginTop: 16 },
});
