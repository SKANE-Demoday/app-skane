import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

/** Adaptador OBD-II desenhado em SVG. `active` = conectado (cores escuras), senão acinzentado. */
export function Dongle({ width = 170, active = true }: { width?: number; active?: boolean }) {
  const body = active ? colors.navy : '#8E98AE';
  const plug = active ? '#1D2E5C' : '#A3ACBF';
  const label = active ? '#2C4FA3' : '#B5BDCD';
  const h = width * 0.52;
  return (
    <Svg width={width} height={h} viewBox="0 0 170 88">
      <G rotation={-14} origin="85,44">
        <Rect x={10} y={26} width={108} height={44} rx={10} fill={body} />
        <Rect x={22} y={36} width={74} height={18} rx={4} fill={label} />
        <SvgText x={59} y={49.5} fontSize={11} fontWeight="900" fontStyle="italic" fill="#FFFFFF" textAnchor="middle">
          SKANE
        </SvgText>
        <Rect x={114} y={20} width={48} height={52} rx={6} fill={plug} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={128 + c * 9} y={30 + r * 11} width={5} height={7} rx={1} fill="#FFFFFF" />),
        )}
      </G>
    </Svg>
  );
}

export function LineChart({ data, height = 170, color = colors.blue }: { data: number[]; height?: number; color?: string }) {
  const [w, setW] = React.useState(300);
  const padL = 34;
  const padB = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const x = (i: number) => padL + (i / (data.length - 1)) * (w - padL - 4);
  const y = (v: number) => 6 + (1 - (v - min) / span) * (height - padB - 12);
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const ticks = [max, (max + min) / 2, min];
  const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={height}>
        {ticks.map((t) => (
          <G key={t}>
            <Line x1={padL} x2={w} y1={y(t)} y2={y(t)} stroke={colors.border} strokeWidth={1} />
            <SvgText x={0} y={y(t) + 4} fontSize={10} fill={colors.muted}>
              {fmt(t)}
            </SvgText>
          </G>
        ))}
        <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
        <SvgText x={padL} y={height - 4} fontSize={10} fill={colors.muted}>
          -60 min
        </SvgText>
        <SvgText x={w - 4} y={height - 4} fontSize={10} fill={colors.muted} textAnchor="end">
          agora
        </SvgText>
      </Svg>
    </View>
  );
}

/** Medidor em arco de 270°: 0 L embaixo à esquerda, capacidade máxima embaixo à direita. */
export function FuelGauge({ liters, capacity }: { liters: number; capacity: number }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = 86;
  const start = 135;
  const sweep = 270;
  const pt = (deg: number, rad = r) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
  };
  const arc = (to: number) => {
    const a = pt(start);
    const b = pt(start + to);
    return `M${a.x},${a.y} A${r},${r} 0 ${to > 180 ? 1 : 0} 1 ${b.x},${b.y}`;
  };
  const frac = Math.max(0, Math.min(1, liters / capacity));
  const knob = pt(start + sweep * frac);
  const ticks = [0, 10, 20, 30, 40].filter((t) => t <= capacity);
  return (
    <View style={{ alignItems: 'center' }} accessibilityLabel={`${liters} litros estimados no tanque`}>
      <Svg width={size} height={size - 20}>
        <Path d={arc(sweep)} stroke={colors.blueSoft} strokeWidth={14} fill="none" strokeLinecap="round" />
        {frac > 0 && <Path d={arc(sweep * frac)} stroke={colors.blue} strokeWidth={14} fill="none" strokeLinecap="round" />}
        <Circle cx={knob.x} cy={knob.y} r={9} fill="#FFFFFF" stroke={colors.blue} strokeWidth={3} />
        {ticks.map((t) => {
          const p = pt(start + sweep * (t / capacity), r + 24);
          return (
            <SvgText key={t} x={p.x} y={p.y + 4} fontSize={11} fill={colors.muted} textAnchor="middle">
              {`${t}L`}
            </SvgText>
          );
        })}
        <Circle cx={cx} cy={cy} r={58} fill="#FFFFFF" />
      </Svg>
      <View style={{ position: 'absolute', top: cy - 30, alignItems: 'center' }}>
        <Text style={{ fontSize: 40, fontWeight: '800', color: colors.navy }}>{liters} L</Text>
        <Text style={{ fontSize: 11, color: colors.muted }}>estimados no tanque</Text>
      </View>
    </View>
  );
}
