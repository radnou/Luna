import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { responsive } from '@/utils/platform';

interface ResponsiveGridProps extends ViewProps {
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  children: React.ReactNode;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  style,
  children,
  ...props
}) => {
  const columnCount = responsive(
    columns.mobile || 1,
    columns.tablet || columns.mobile || 1,
    columns.desktop || columns.tablet || columns.mobile || 1
  );

  const childrenArray = React.Children.toArray(children);

  return (
    <View style={[styles.container, { gap }, style]} {...props}>
      {childrenArray.map((child, index) => (
        <View
          key={index}
          style={[
            styles.gridItem,
            {
              width: `${100 / columnCount}%`,
              paddingRight: index % columnCount === columnCount - 1 ? 0 : gap,
              marginBottom: gap,
            },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    paddingHorizontal: 8,
  },
});