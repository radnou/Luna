export * from './colors';
export * from './typography';
export * from './spacing';

import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  padding: {
    padding: spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
  paddingVertical: {
    paddingVertical: spacing.md,
  },
  marginBottom: {
    marginBottom: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
});