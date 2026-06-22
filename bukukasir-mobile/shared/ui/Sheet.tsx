import React from 'react';
import { Modal, View, Text, Dimensions, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../theme';

interface SheetProps {
  visible: boolean;
  onDismiss: () => void;
  snapPoints?: number[];
  title?: string;
  children: React.ReactNode;
}

const SCREEN = Dimensions.get('window').height;

export function Sheet({ visible, onDismiss, snapPoints, title, children }: SheetProps) {
  const defaultSnap = snapPoints?.[0] ?? SCREEN * 0.6;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={[styles.sheet, { height: defaultSnap }]}>
        <View style={styles.handle} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: theme.spacing[16] }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: theme.palette.neutral[0],
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.spacing[4],
    ...theme.elevation.lg,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: theme.palette.neutral[300],
    alignSelf: 'center', marginBottom: theme.spacing[3],
  },
  title: { ...theme.type.headline, color: theme.palette.neutral[900], marginBottom: theme.spacing[3] },
});
