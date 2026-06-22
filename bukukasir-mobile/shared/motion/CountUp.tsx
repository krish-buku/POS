import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface CountUpProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  style?: StyleProp<TextStyle>;
}

export function CountUp({ value, format, duration, style }: CountUpProps) {
  const safeValue = typeof value === 'number' && isFinite(value) ? value : 0;
  const [displayed, setDisplayed] = useState(safeValue);

  useEffect(() => {
    setDisplayed(safeValue);
    void duration;
  }, [safeValue, duration]);

  return (
    <Text style={style}>
      {format ? format(displayed) : Math.round(displayed).toString()}
    </Text>
  );
}
