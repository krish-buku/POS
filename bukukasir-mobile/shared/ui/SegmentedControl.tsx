import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../theme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const [width, setWidth] = React.useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segmentW = width / Math.max(1, options.length);
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withTiming(index * segmentW, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [index, segmentW, x]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: segmentW,
  }));

  return (
    <View
      style={styles.track}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 ? <Animated.View style={[styles.pill, pillStyle]} /> : null}
      {options.map((opt, i) => {
        const focused = i === index;
        return (
          <Pressable
            key={opt.value}
            style={styles.segment}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: focused }}
            aria-selected={focused}
          >
            <Text
              style={[
                styles.label,
                { color: focused ? theme.palette.neutral[900] : theme.palette.neutral[500] },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: theme.palette.neutral[100],
    borderRadius: theme.radii.md,
    padding: 3,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 3, bottom: 3,
    left: 3,
    backgroundColor: theme.palette.neutral[0],
    borderRadius: theme.radii.md - 2,
    ...theme.elevation.sm,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing[2] },
  label: { ...theme.type.caption, fontWeight: '600' },
});
