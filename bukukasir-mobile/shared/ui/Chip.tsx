import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { PressScale } from '../motion/PressScale';
import { theme } from '../theme';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  leading?: React.ReactNode;
  tone?: Tone;
  accessibilityLabel?: string;
}

const toneBg: Record<Tone, string> = {
  neutral: theme.palette.neutral[100],
  brand: theme.palette.brand.navy,
  success: theme.palette.semantic.success,
  warning: theme.palette.semantic.warning,
  error: theme.palette.semantic.error,
};

export function Chip({ children, selected, onPress, leading, tone = 'brand', accessibilityLabel }: ChipProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: theme.motion.duration.fast });
  }, [selected, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.palette.neutral[100], toneBg[tone]]
    ),
  }));

  const animatedText = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [theme.palette.neutral[800], tone === 'neutral' ? theme.palette.neutral[900] : '#FFFFFF']
    ),
  }));

  const content = (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[2],
          borderRadius: theme.radii.full,
        },
        animatedStyle,
      ]}
    >
      {leading ? <View style={{ marginRight: 6 }}>{leading}</View> : null}
      <Animated.Text style={[{ fontSize: 13, fontWeight: '600' }, animatedText]}>
        {children}
      </Animated.Text>
    </Animated.View>
  );

  if (!onPress) return content;
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityState={{ selected: !!selected }}
      aria-selected={!!selected}
    >
      {content}
    </PressScale>
  );
}
