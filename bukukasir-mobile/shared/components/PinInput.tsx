import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors } from '../constants/colors';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string | null;
  label?: string;
  accessibilityLabel?: string;
}

export function PinInput({ length = 6, onComplete, error, label, accessibilityLabel }: PinInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const inputLabel = accessibilityLabel || label || 'PIN entry';

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    setValue(cleaned);
    if (cleaned.length === length) {
      onComplete(cleaned);
    }
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const boxes = Array.from({ length }, (_, i) => {
    const char = value[i] || '';
    const isFocused = i === value.length;
    return (
      <View
        key={i}
        style={[
          styles.box,
          isFocused && styles.boxFocused,
          error ? styles.boxError : null,
          char ? styles.boxFilled : null,
        ]}
      >
        <Text style={styles.boxText}>{char ? '\u2022' : ''}</Text>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={handlePress}
        style={styles.boxRow}
        accessibilityRole="button"
        accessibilityLabel={inputLabel}
        accessibilityHint="Double tap to edit PIN"
        accessibilityValue={{ text: `${value.length} of ${length} digits entered` }}
      >
        {boxes}
      </Pressable>
      <TextInput
        ref={inputRef}
        accessibilityLabel={inputLabel}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        autoFocus
        secureTextEntry
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 16,
  },
  boxRow: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  boxFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  boxError: {
    borderColor: Colors.error,
  },
  boxFilled: {
    borderColor: Colors.primary,
  },
  boxText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
});
