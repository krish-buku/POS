import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme';
import { FadeIn } from '../motion/FadeIn';

interface EmptyStateProps {
  icon?: React.ReactNode | string;
  title: string;
  subtitle?: string;
  description?: string;
  cta?: React.ReactNode | string;
  onCtaPress?: () => void;
  secondaryCta?: React.ReactNode | string;
  onSecondaryCtaPress?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  description,
  cta,
  onCtaPress,
  secondaryCta,
  onSecondaryCtaPress,
}: EmptyStateProps) {
  const body = subtitle ?? description;
  const iconNode =
    typeof icon === 'string' ? (
      <Text style={{ fontSize: 40 }}>{icon}</Text>
    ) : (
      icon
    );

  const renderAction = (
    label: React.ReactNode | string | undefined,
    onPress: (() => void) | undefined,
    primary: boolean,
  ) => {
    if (!label) return null;
    if (typeof label !== 'string') return label;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        hitSlop={8}
        style={({ pressed }) => ({
          minHeight: 44,
          minWidth: 156,
          paddingHorizontal: theme.spacing[6],
          borderRadius: theme.radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: primary ? theme.palette.brand.navy : theme.palette.neutral[0],
          borderWidth: 1,
          borderColor: primary ? theme.palette.brand.navy : theme.palette.neutral[300],
          opacity: pressed ? 0.86 : 1,
        })}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          style={{
            color: primary ? theme.palette.neutral[0] : theme.palette.neutral[800],
            fontWeight: '800',
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const ctaNode = renderAction(cta, onCtaPress, true);
  const secondaryCtaNode = renderAction(secondaryCta, onSecondaryCtaPress, false);

  return (
    <FadeIn>
      <View style={styles.wrap}>
        {iconNode ? <View style={{ marginBottom: theme.spacing[3] }}>{iconNode}</View> : null}
        <Text style={styles.title}>{title}</Text>
        {body ? <Text style={styles.desc}>{body}</Text> : null}
        {ctaNode || secondaryCtaNode ? (
          <View style={styles.actions}>
            {ctaNode}
            {secondaryCtaNode}
          </View>
        ) : null}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
  },
  title: {
    ...theme.type.headline,
    color: theme.palette.neutral[900],
    textAlign: 'center',
  },
  desc: {
    ...theme.type.body,
    color: theme.palette.neutral[500],
    textAlign: 'center',
    marginTop: theme.spacing[2],
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing[3],
    marginTop: theme.spacing[5],
  },
});
