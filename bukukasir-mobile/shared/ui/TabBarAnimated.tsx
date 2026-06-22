import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../theme';

type Props = BottomTabBarProps & { roleColor?: string };

export function TabBarAnimated({ state, descriptors, navigation, roleColor }: Props) {
  const accent = roleColor ?? theme.palette.brand.navy;
  const tabWidth = 100 / state.routes.length;
  const x = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    x.value = withTiming(state.index * tabWidth, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [state.index, tabWidth, x]);

  const inkStyle = useAnimatedStyle(() => ({
    left: `${x.value}%` as any,
    width: `${tabWidth}%` as any,
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ink, inkStyle]}>
        <View style={[styles.inkPill, { backgroundColor: accent }]} />
      </Animated.View>
      {state.routes.map((route, i) => {
        const { options } = descriptors[route.key];
        const label = (options.tabBarLabel as string) ?? options.title ?? route.name;
        const focused = state.index === i;
        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityLabel={String(label)}
            accessibilityState={{ selected: focused }}
            testID={`tab-${route.name}`}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            {options.tabBarIcon
              ? options.tabBarIcon({ focused, color: focused ? accent : theme.palette.neutral[500], size: 22 })
              : (
                <Text
                  style={[
                    styles.label,
                    { color: focused ? accent : theme.palette.neutral[500] },
                  ]}
                >
                  {label}
                </Text>
              )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: theme.palette.neutral[0],
    borderTopWidth: 1,
    borderTopColor: theme.palette.neutral[200],
    paddingVertical: theme.spacing[2],
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  label: { ...theme.type.caption, fontWeight: '600' },
  ink: { position: 'absolute', top: 4, bottom: 4, alignItems: 'center', justifyContent: 'center' },
  inkPill: {
    width: 28, height: 3, borderRadius: 2,
    position: 'absolute', bottom: 0,
  },
});
