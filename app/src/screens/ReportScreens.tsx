import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Share, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Button, Card, Screen, styles as ui } from '../components/ui';
import { useApp } from '../context/AppContext';
import { RootStackParamList, useNav } from '../navigation/types';
import { fmtDate } from '../services/diagnostics';
import { STATIONS } from '../services/data';
import { colors } from '../theme';
import { Report } from '../types';

export function ReportScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Report'>>();
  const { reports, generateReport } = useApp();
  const [report, setReport] = useState<Report | undefined>(() => reports.find((r) => r.id === params?.reportId));

  useEffect(() => {
    if (!report) setReport(generateReport());
    // gera um relatório novo só ao abrir sem reportId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const share = async () => {
    if (!report) return;
    try {
      await Share.share({ message: report.text, title: 'Relatório SKANE' });
    } catch {
      Alert.alert('Não foi possível compartilhar', 'Tente de novo em instantes.');
    }
  };

  return (
    <Screen title="Relatório de consulta" back footer={<Button label="Compartilhar relatório" variant="navy" icon="share-outline" onPress={share} disabled={!report} />}>
      <Card>
        <Text style={{ fontSize: 13, lineHeight: 19, color: colors.text }}>{report?.text ?? 'Gerando…'}</Text>
      </Card>
      {report && (
        <View style={[ui.row, { gap: 8, paddingHorizontal: 4 }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.green} />
          <Text style={[ui.muted, { flex: 1 }]}>Relatório gerado. Envie para o mecânico pelo app que preferir.</Text>
        </View>
      )}
    </Screen>
  );
}

export function HistoryScreen() {
  const nav = useNav();
  const { reports, refuels } = useApp();
  return (
    <Screen title="Histórico" back>
      <Card>
        <Text style={[ui.sectionTitle, { marginBottom: 6 }]}>Relatórios</Text>
        {reports.length === 0 ? (
          <Pressable onPress={() => nav.navigate('Report')}>
            <Text style={ui.muted}>Nenhum relatório ainda.</Text>
            <Text style={{ color: colors.blue, fontWeight: '600', marginTop: 4 }}>Gerar o primeiro relatório</Text>
          </Pressable>
        ) : (
          reports.map((r, i) => (
            <Pressable key={r.id} onPress={() => nav.navigate('Report', { reportId: r.id })}>
              {i > 0 && <View style={ui.divider} />}
              <View style={[ui.row, { paddingVertical: 12 }]}>
                <Ionicons name="document-text-outline" size={20} color={colors.blue} style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, color: colors.text }}>Diagnóstico de {fmtDate(new Date(r.createdAt))}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </View>
            </Pressable>
          ))
        )}
      </Card>
      <Card>
        <Text style={[ui.sectionTitle, { marginBottom: 6 }]}>Abastecimentos</Text>
        {refuels.map((r, i) => (
          <View key={r.id}>
            {i > 0 && <View style={ui.divider} />}
            <View style={[ui.row, { paddingVertical: 10 }]}>
              <Text style={{ flex: 1, color: colors.text }}>{STATIONS.find((s) => s.id === r.stationId)?.name}</Text>
              <Text style={ui.muted}>{fmtDate(new Date(r.date))}</Text>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
