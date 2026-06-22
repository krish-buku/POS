import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { PressScale } from '../motion/PressScale';
import { theme } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

const heights: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
const padX: Record<Size, number> = { sm: 12, md: 16, lg: 20 };
const fontSizes: Record<Size, number> = { sm: 14, md: 16, lg: 17 };

function bgFor(v: Variant) {
  switch (v) {
    case 'primary': return theme.palette.brand.navy;
    case 'secondary': return theme.palette.neutral[100];
    case 'ghost': return 'transparent';
    case 'destructive': return theme.palette.semantic.error;
  }
}
function fgFor(v: Variant) {
  switch (v) {
    case 'primary': return '#FFFFFF';
    case 'secondary': return theme.palette.neutral[800];
    case 'ghost': return theme.palette.brand.navy;
    case 'destructive': return '#FFFFFF';
  }
}

export function Button({
  children, onPress, variant = 'primary', size = 'md',
  leading, trailing, loading, disabled, style, accessibilityLabel, testID,
}: ButtonProps) {
  const bg = bgFor(variant);
  const fg = fgFor(variant);
  const isOff = disabled || loading;

  return (
    <PressScale
      onPress={onPress}
      disabled={isOff}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isOff, busy: !!loading }}
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          height: heights[size],
          paddingHorizontal: padX[size],
          opacity: isOff ? 0.5 : 1,
          borderRadius: theme.radii.md,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {leading}
            <Text style={{ color: fg, fontSize: fontSizes[size], fontWeight: '600', marginHorizontal: leading || trailing ? 6 : 0 }}>
              {children}
            </Text>
            {trailing}
          </>
        )}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
