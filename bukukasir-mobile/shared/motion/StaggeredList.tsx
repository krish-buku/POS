import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { FadeIn } from './FadeIn';

interface StaggeredListProps {
  children: React.ReactNode;
  // Both spellings accepted.
  staggerMs?: number;
  stagger?: number;
  baseDelay?: number;
  style?: StyleProp<ViewStyle>;
}

export function StaggeredList({
  children,
  staggerMs,
  stagger,
  baseDelay = 0,
  style,
}: StaggeredListProps) {
  const step = staggerMs ?? stagger ?? 40;
  const kids = React.Children.toArray(children);

  // If a single child is provided (e.g., a FlatList), just wrap in one FadeIn.
  if (kids.length <= 1) {
    return (
      <View style={style}>
        <FadeIn delay={baseDelay}>{kids[0] ?? null}</FadeIn>
      </View>
    );
  }

  return (
    <View style={style}>
      {kids.map((child, i) => (
        <FadeIn key={i} delay={baseDelay + i * step}>
          {child}
        </FadeIn>
      ))}
    </View>
  );
}
