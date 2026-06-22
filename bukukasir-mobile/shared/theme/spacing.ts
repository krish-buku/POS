// Spacing scale. Supports both step-index keys (0-14) mapped via a 4px grid
// and raw pixel keys (12, 16, 20, 24, 32, 40, 56) for callers that pass
// the final pixel value directly. Values are numeric px.
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  14: 56,
  // Raw pixel aliases (common design-token values):
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  56: 56,
} as const;
