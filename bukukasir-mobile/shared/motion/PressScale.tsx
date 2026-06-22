import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type HapticStyle = 'light' | 'medium' | 'heavy';

interface PressScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hapticStyle?: HapticStyle;
  accessibilityLabel?: string;
  accessibilityRole?: React.ComponentProps<typeof Pressable>['accessibilityRole'];
  accessibilityState?: React.ComponentProps<typeof Pressable>['accessibilityState'];
  accessibilityHint?: string;
  accessibilityValue?: React.ComponentProps<typeof Pressable>['accessibilityValue'];
  hitSlop?: React.ComponentProps<typeof Pressable>['hitSlop'];
  'aria-selected'?: React.ComponentProps<typeof Pressable>['aria-selected'];
  'aria-checked'?: React.ComponentProps<typeof Pressable>['aria-checked'];
  testID?: string;
}

export function PressScale({
  children,
  onPress,
  onPressIn: onPressInProp,
  onPressOut: onPressOutProp,
  onLongPress,
  disabled,
  style,
  hapticStyle: _hapticStyle = 'light',
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  accessibilityHint,
  accessibilityValue,
  hitSlop,
  'aria-selected': ariaSelected,
  'aria-checked': ariaChecked,
  testID,
}: PressScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, {
      duration: 90,
      easing: Easing.out(Easing.quad),
    });
    onPressInProp?.();
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 140,
      easing: Easing.out(Easing.quad),
    });
    onPressOutProp?.();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityHint={accessibilityHint}
      accessibilityValue={accessibilityValue}
      hitSlop={hitSlop}
      aria-selected={ariaSelected}
      aria-checked={ariaChecked}
      testID={testID}
    >
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
