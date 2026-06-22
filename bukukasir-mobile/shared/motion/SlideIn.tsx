import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { theme } from '../theme';

type Direction = 'bottom' | 'right' | 'top' | 'left';

interface SlideInProps {
  children: React.ReactNode;
  from: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export function SlideIn({
  children,
  from,
  distance = 20,
  delay = 0,
  duration,
  style,
}: SlideInProps) {
  const axis = from === 'left' || from === 'right' ? 'x' : 'y';
  const initial = from === 'bottom' || from === 'right' ? distance : -distance;
  const offset = useSharedValue(initial);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const d = duration ?? theme.motion.duration.normal;
    offset.value = withDelay(delay, withTiming(0, { duration: d }));
    opacity.value = withDelay(delay, withTiming(1, { duration: d }));
  }, [delay, duration, offset, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform:
      axis === 'x'
        ? [{ translateX: offset.value }]
        : [{ translateY: offset.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
