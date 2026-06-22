import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../theme';

interface SkeletonBlockProps {
  width: number | `${number}%`;
  height: number;
  radius?: number;
}

export function SkeletonBlock({ width, height, radius }: SkeletonBlockProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 900 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radii.sm,
          backgroundColor: theme.palette.neutral[200],
        },
        animatedStyle,
      ]}
    />
  );
}
