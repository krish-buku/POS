export * from './colors';
export * from './spacing';
export * from './radii';
export * from './typography';
export * from './elevation';
export * from './motion';

import { palette } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { type } from './typography';
import { elevation } from './elevation';
import { motion } from './motion';

export const theme = { palette, spacing, radii, type, elevation, motion } as const;
export const useTheme = () => theme;
