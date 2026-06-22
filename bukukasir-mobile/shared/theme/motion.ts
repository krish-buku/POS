import { Easing } from 'react-native-reanimated';

export const motion = {
  duration: { instant: 100, fast: 180, normal: 240, slow: 360 },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    emphasized: Easing.bezier(0.3, 0, 0, 1),
  },
  // Critically-damped / near-critically-damped springs — no overshoot.
  spring: {
    gentle: { damping: 28, stiffness: 220, mass: 1 },
    snappy: { damping: 26, stiffness: 320, mass: 1 },
    bouncy: { damping: 22, stiffness: 260, mass: 1 },
  },
} as const;
