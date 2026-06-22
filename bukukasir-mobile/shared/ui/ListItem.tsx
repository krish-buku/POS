import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PressScale } from '../motion/PressScale';
import { theme } from '../theme';

interface ListItemProps {
  leading?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

export function ListItem({ leading, title, subtitle, trailing, onPress }: ListItemProps) {
  const content = (
    <View style={styles.row}>
      {leading ? <View style={{ marginRight: theme.spacing[3] }}>{leading}</View> : null}
      <View style={{ flex: 1 }}>
        {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={{ marginLeft: theme.spacing[3] }}>{trailing}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <PressScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={typeof title === 'string' ? title : undefined}
      >
        {content}
      </PressScale>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.palette.neutral[0],
  },
  title: { ...theme.type.body, color: theme.palette.neutral[900] },
  subtitle: { ...theme.type.caption, color: theme.palette.neutral[500], marginTop: 2 },
});
