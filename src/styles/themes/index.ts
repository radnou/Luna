export * from './lightTheme';
export * from './darkTheme';

import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;
export type ThemeGradients = typeof lightTheme.gradients;