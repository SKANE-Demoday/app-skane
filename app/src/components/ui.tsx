import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme';

export function Logo({ light = false }: { light?: boolean }) {
  const c = light ? '#FFFFFF' : colors.navy;
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <Svg width={70} height={12} viewBox="0 0 70 12">
        <Path d="M4 11 C 14 2, 30 0, 44 3 S 62 9, 68 11" stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </Svg>
      <Text style={[styles.logo, { color: c }]}>SKANE</Text>
    </View>
  );
}

export function Header({ title, back }: { title: string; back?: boolean }) {
  const nav = useNavigation();
  return (
    <View style={styles.header}>
      <View style={{ width: 40 }}>
        {back && (
          <Pressable onPress={() => nav.goBack()} hitSlop={12} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        )}
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <Logo />
    </View>
  );
}

export function Screen({
  title,
  back,
  children,
  footer,
  scroll = true,
}: {
  title?: string;
  back?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {title ? <Header title={title} back={back} /> : null}
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'navy' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
}) {
  const bg = variant === 'primary' ? colors.blue : variant === 'navy' ? colors.navy : 'transparent';
  const fg = variant === 'outline' ? colors.navy : '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.navy },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? { backgroundColor: colors.navy, borderColor: colors.navy } : null]}
    >
      <Text style={[styles.chipText, selected ? { color: '#FFFFFF' } : null]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color, soft }: { label: string; color: string; soft: string }) {
  return (
    <View style={{ backgroundColor: soft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill }}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  logo: { fontSize: 15, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1.5, marginTop: -2 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16 },
  footer: { padding: 16, paddingBottom: 24, gap: 10, backgroundColor: colors.bg },
  btn: { height: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  btnText: { fontSize: 15, fontWeight: '700' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  muted: { fontSize: 12, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
