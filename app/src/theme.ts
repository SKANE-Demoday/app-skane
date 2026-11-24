export const colors = {
  bg: '#EEF2F9',
  card: '#FFFFFF',
  navy: '#0E1F4D',
  blue: '#0B57D0',
  blueSoft: '#E3ECFB',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  green: '#15803D',
  greenSoft: '#DCFCE7',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  amber: '#B45309',
  amberIcon: '#F59E0B',
  amberSoft: '#FEF3C7',
  offline: '#D9DEE8',
};

export const radius = { lg: 18, md: 14, sm: 10, pill: 999 };

export type Tone = { label: string; color: string; soft: string };

export function scoreTone(score: number): Tone {
  if (score >= 80) return { label: 'Ótimo', color: colors.green, soft: colors.greenSoft };
  if (score >= 60) return { label: 'Regular', color: colors.amber, soft: colors.amberSoft };
  return { label: 'Atenção', color: colors.red, soft: colors.redSoft };
}
