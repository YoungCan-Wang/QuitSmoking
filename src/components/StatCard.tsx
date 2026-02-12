import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = COLORS.primary,
}: StatCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        {icon && <Text style={[styles.icon, { color }]}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
