import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { isWeb, isDesktop, maxWidth } from '@/utils/platform';
import { colors } from '@/styles/colors';

interface WebLayoutProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof maxWidth;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: boolean;
}

export const WebLayout: React.FC<WebLayoutProps> = ({
  children,
  maxWidth: maxWidthKey = 'large',
  sidebar,
  header,
  footer,
  padding = true,
}) => {
  if (!isWeb) {
    return <>{children}</>;
  }

  const containerMaxWidth = maxWidth[maxWidthKey];

  return (
    <View style={styles.root}>
      {header && <View style={styles.header}>{header}</View>}
      
      <View style={styles.mainContainer}>
        {sidebar && isDesktop && (
          <View style={styles.sidebar}>
            {sidebar}
          </View>
        )}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { maxWidth: containerMaxWidth },
            padding && styles.padding,
          ]}
        >
          {children}
        </ScrollView>
      </View>
      
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...isWeb && {
      position: 'sticky' as any,
      top: 0,
      zIndex: 100,
    },
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    ...isWeb && {
      position: 'sticky' as any,
      top: 64, // Header height
      height: 'calc(100vh - 64px)' as any,
      overflowY: 'auto' as any,
    },
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  padding: {
    padding: 24,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 24,
  },
});