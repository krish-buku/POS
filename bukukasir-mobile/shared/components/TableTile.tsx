import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme';
import type { TableStatus } from '../constants/colors';
import { useT } from '../i18n/store';
import type { TranslationKey } from '../i18n/translations';

type TableShape = 'square' | 'round' | 'long';

interface TableTileProps {
  id: string;
  label: string;
  shape?: TableShape;
  seats: number;
  status: TableStatus;
  runningTotal?: number;
  sessions?: number;
  guests?: number;
  selected?: boolean;
  pending?: boolean;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

const STATUS_META = {
  available: { fill: '#FFFFFF', stroke: '#10B981', ink: '#047857', labelKey: 'tables.status.available', icon: '○' },
  occupied: { fill: '#FEE2E2', stroke: '#EF4444', ink: '#B91C1C', labelKey: 'tables.status.occupied', icon: '●' },
  open: { fill: '#FEF3C7', stroke: '#F59E0B', ink: '#92400E', labelKey: 'tables.status.openTab', icon: '◐' },
  reserved: { fill: '#DBEAFE', stroke: '#006AFF', ink: '#0756C8', labelKey: 'tables.status.reserved', icon: '◇' },
  cleaning: { fill: '#EDE9FE', stroke: '#8B5CF6', ink: '#6D28D9', labelKey: 'tables.status.cleaning', icon: '⟲' },
} as const;

function chairPositions(shape: TableShape, seats: number) {
  const count = Math.max(1, Math.min(12, seats));
  if (shape === 'round') {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      return {
        cx: 50 + Math.cos(angle) * 50,
        cy: 50 + Math.sin(angle) * 50,
        angle: (angle * 180) / Math.PI + 90,
      };
    });
  }
  if (shape === 'long') {
    const top = Math.ceil(count / 2);
    const bottom = count - top;
    return [
      ...Array.from({ length: top }).map((_, i) => ({
        cx: 18 + ((i + 0.5) / top) * 64,
        cy: 14,
        angle: 180,
      })),
      ...Array.from({ length: bottom }).map((_, i) => ({
        cx: 18 + ((i + 0.5) / Math.max(1, bottom)) * 64,
        cy: 48,
        angle: 0,
      })),
    ];
  }
  const sides: number[][] = [[], [], [], []];
  for (let i = 0; i < count; i += 1) sides[i % 4].push(i);
  return [
    ...sides[0].map((_, i, arr) => ({ cx: 22 + ((i + 0.5) / arr.length) * 56, cy: 10, angle: 180 })),
    ...sides[1].map((_, i, arr) => ({ cx: 90, cy: 22 + ((i + 0.5) / arr.length) * 56, angle: 270 })),
    ...sides[2].map((_, i, arr) => ({ cx: 22 + ((i + 0.5) / arr.length) * 56, cy: 90, angle: 0 })),
    ...sides[3].map((_, i, arr) => ({ cx: 10, cy: 22 + ((i + 0.5) / arr.length) * 56, angle: 90 })),
  ];
}

export function TableTile({
  label,
  shape = 'square',
  seats,
  status,
  runningTotal = 0,
  sessions,
  guests,
  selected,
  pending,
  size = 142,
  onPress,
  onLongPress,
}: TableTileProps) {
  const theme = useTheme();
  const t = useT();
  const effectiveStatus = status === 'occupied' && runningTotal > 0 ? 'open' : status;
  const meta = STATUS_META[effectiveStatus] ?? STATUS_META.available;
  const width = size;
  const height = shape === 'long' ? Math.round(size * 0.62) : size;
  const viewBoxHeight = shape === 'long' ? 62 : 100;
  const chairs = chairPositions(shape, seats);
  const displayStatus = t(meta.labelKey as TranslationKey);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${displayStatus}, ${seats} ${t('tables.seats')}`}
      style={({ pressed }) => ({
        width,
        minHeight: height + 54,
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        style={{
          borderRadius: 10,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? theme.palette.brand.navy : 'transparent',
          padding: 2,
        }}
      >
        <Svg width={width - 4} height={height} viewBox={`0 0 100 ${viewBoxHeight}`}>
          {selected ? (
            <Rect x={1} y={1} width={98} height={viewBoxHeight - 2} rx={6} fill="none" stroke={theme.palette.brand.navy} strokeWidth={2} />
          ) : null}
          {chairs.map((chair, index) => (
            <G key={index} x={chair.cx} y={chair.cy} rotation={chair.angle}>
              <Rect x={-3.5} y={-2.5} width={7} height={5} rx={1.4} fill="#FFFFFF" stroke={meta.stroke} strokeWidth={0.8} />
            </G>
          ))}
          {shape === 'round' ? (
            <Circle cx={50} cy={50} r={36} fill={meta.fill} stroke={meta.stroke} strokeWidth={2.2} />
          ) : shape === 'long' ? (
            <Rect x={14} y={20} width={72} height={22} rx={4} fill={meta.fill} stroke={meta.stroke} strokeWidth={2.2} />
          ) : (
            <Rect x={20} y={20} width={60} height={60} rx={5} fill={meta.fill} stroke={meta.stroke} strokeWidth={2.2} />
          )}
          <Circle cx={shape === 'long' ? 17 : 25} cy={shape === 'long' ? 25 : 26} r={3.5} fill={meta.stroke} />
          <SvgText
            x={50}
            y={shape === 'long' ? 36 : 56}
            textAnchor="middle"
            fill={meta.ink}
            fontWeight="800"
            fontSize={shape === 'long' ? 14 : 22}
          >
            {label.replace(/^Meja\s*/i, '')}
          </SvgText>
          {(effectiveStatus === 'occupied' || effectiveStatus === 'open') && shape !== 'long' ? (
            <SvgText x={76} y={73} textAnchor="middle" fill={meta.ink} fontWeight="700" fontSize={8}>
              {guests || seats}/{seats}
            </SvgText>
          ) : null}
        </Svg>
      </View>
      <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: meta.ink,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {meta.icon} {displayStatus}
          {sessions ? ` · ${sessions} ${t('tables.sessions')}` : ''}
          {pending ? ' · pending' : ''}
        </Text>
        <Text
          style={{
            color: theme.palette.neutral[900],
            fontSize: 10,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
            marginLeft: 6,
          }}
        >
          {runningTotal > 0 ? `${Math.round(runningTotal / 1000)}k` : `${seats} ${t('tables.seats')}`}
        </Text>
      </View>
    </Pressable>
  );
}
