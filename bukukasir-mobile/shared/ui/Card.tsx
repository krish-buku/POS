import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { FadeIn } from '../motion/FadeIn';
import { theme } from '../theme';

type ElevationKey = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  elevation?: ElevationKey;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  elevation = 'sm',
  padding = theme.spacing[4],
  style,
}: CardProps) {
  return (
    <FadeIn>
      <View
        style={[
          {
            backgroundColor: theme.palette.neutral[0],
            borderRadius: theme.radii.lg,
            padding,
          },
          theme.elevation[elevation],
          style,
        ]}
      >
        {children}
      </View>
    </FadeIn>
  );
}
