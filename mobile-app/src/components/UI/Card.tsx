import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  bordered = true,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          padding: theme.spacing[padding],
          borderWidth: bordered ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
}); 