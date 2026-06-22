import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../motion/SkeletonBlock';
import { theme } from '../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
}

function SkeletonBase({ width = '100%', height = 16, radius }: SkeletonProps) {
  return <SkeletonBlock width={width} height={height} radius={radius} />;
}

function SkeletonCard() {
  return (
    <View
      style={{
        padding: theme.spacing[4],
        borderRadius: theme.radii.lg,
        backgroundColor: theme.palette.neutral[0],
        ...theme.elevation.sm,
      }}
    >
      <SkeletonBlock width="60%" height={20} />
      <View style={{ height: theme.spacing[2] }} />
      <SkeletonBlock width="100%" height={14} />
      <View style={{ height: theme.spacing[1] }} />
      <SkeletonBlock width="80%" height={14} />
    </View>
  );
}

function SkeletonListItem() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
      }}
    >
      <SkeletonBlock width={40} height={40} radius={theme.radii.full} />
      <View style={{ marginLeft: theme.spacing[3], flex: 1 }}>
        <SkeletonBlock width="50%" height={16} />
        <View style={{ height: 6 }} />
        <SkeletonBlock width="70%" height={12} />
      </View>
    </View>
  );
}

export const Skeleton = Object.assign(SkeletonBase, {
  Card: SkeletonCard,
  ListItem: SkeletonListItem,
});
