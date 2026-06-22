import React, { useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../theme';

type Kind = 'table' | 'kitchen' | 'order';
type SizeKey = 'sm' | 'md' | 'small' | 'medium';

interface StatusPillProps {
  status: string;
  // Accept either `kind` (historical) or `tone` (new) — both mean the same thing.
  kind?: Kind;
  tone?: Kind;
  size?: SizeKey;
}

function colorsFor(kind: Kind, status: string): { fg: string; bg: string } {
  const p = theme.palette;
  if (kind === 'table') {
    const t = p.status.table as any;
    const fg = t[status] ?? p.neutral[500];
    const bg = t[`${status}Bg`] ?? p.neutral[100];
    return { fg, bg };
  }
  if (kind === 'kitchen') {
    const k = p.status.kitchen as any;
    const fg = k[status] ?? p.neutral[500];
    return { fg, bg: p.neutral[100] };
  }
  const o = p.status.order as any;
  const fg = o[status] ?? p.neutral[500];
  return { fg, bg: p.neutral[100] };
}

export function StatusPill({ status, kind, tone, size = 'md' }: StatusPillProps) {
  const resolvedKind: Kind = tone ?? kind ?? 'order';
  const { fg, bg } = useMemo(() => colorsFor(resolvedKind, status), [resolvedKind, status]);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: theme.motion.duration.normal });
  }, [status, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [theme.palette.neutral[100], bg]),
  }));

  const isSmall = size === 'sm' || size === 'small';
  const padH = isSmall ? 6 : theme.spacing[2];
  const padV = isSmall ? 2 : 4;
  const fontSize = isSmall ? 10 : 12;

  return (
    <Animated.View
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: padH,
          paddingVertical: padV,
          borderRadius: theme.radii.full,
        },
        animatedStyle,
      ]}
    >
      <Animated.Text style={{ color: fg, fontSize, fontWeight: '700', textTransform: 'capitalize' }}>
        {status}
      </Animated.Text>
    </Animated.View>
  );
}
