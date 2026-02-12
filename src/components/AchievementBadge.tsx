import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const ICONS: { [key: string]: string } = {
  star: '⭐',
  calendar: '📅',
  'calendar-check': '📆',
  award: '🏆',
  trophy: '🏅',
  crown: '👑',
  'check-circle': '✅',
  'thumbs-up': '👍',
  heart: '❤️',
  'dollar-sign': '💰',
  'credit-card': '💳',
  briefcase: '💼',
};

export function AchievementBadge({
  achievement,
  onPress,
  size = 'medium',
}: AchievementBadgeProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const icon = ICONS[achievement.icon] || '🎯';

  const containerStyles = [
    styles.container,
    styles[size],
    isUnlocked ? styles.unlocked : styles.locked,
  ];

  const content = (
    <View style={containerStyles}>
      <View
        style={[
          styles.iconContainer,
          styles[`${size}Icon`],
          isUnlocked ? styles.unlockedIcon : styles.lockedIcon,
        ]}
      >
        <Text style={[styles.icon, styles[`${size}IconText`]]}>
          {isUnlocked ? icon : '🔒'}
        </Text>
      </View>
      <Text
        style={[
          styles.title,
          styles[`${size}Title`],
          isUnlocked ? styles.unlockedText : styles.lockedText,
        ]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>
      {size !== 'small' && (
        <Text style={styles.description} numberOfLines={2}>
          {achievement.description}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  small: {
    width: 80,
    padding: SPACING.sm,
  },
  medium: {
    width: 100,
    padding: SPACING.md,
  },
  large: {
    width: 120,
    padding: SPACING.md,
  },
  unlocked: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  locked: {
    opacity: 0.6,
  },
  iconContainer: {
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  smallIcon: {
    width: 32,
    height: 32,
  },
  mediumIcon: {
    width: 48,
    height: 48,
  },
  largeIcon: {
    width: 56,
    height: 56,
  },
  unlockedIcon: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  lockedIcon: {
    backgroundColor: COLORS.border,
  },
  icon: {
    textAlign: 'center',
  },
  smallIconText: {
    fontSize: 16,
  },
  mediumIconText: {
    fontSize: 24,
  },
  largeIconText: {
    fontSize: 28,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallTitle: {
    fontSize: FONT_SIZE.xs,
  },
  mediumTitle: {
    fontSize: FONT_SIZE.sm,
  },
  largeTitle: {
    fontSize: FONT_SIZE.md,
  },
  unlockedText: {
    color: COLORS.text,
  },
  lockedText: {
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
