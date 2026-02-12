import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HealthMilestone } from '../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

interface HealthMilestoneItemProps {
  milestone: HealthMilestone;
  isCompleted: boolean;
  isNext: boolean;
}

export function HealthMilestoneItem({
  milestone,
  isCompleted,
  isNext,
}: HealthMilestoneItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            isCompleted && styles.completedDot,
            isNext && styles.nextDot,
          ]}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        {isNext && <View style={styles.lineNext} />}
        {isCompleted && !isNext && <View style={styles.lineCompleted} />}
      </View>

      <View
        style={[
          styles.content,
          isCompleted && styles.completedContent,
          isNext && styles.nextContent,
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isCompleted && styles.completedTitle,
              isNext && styles.nextTitle,
            ]}
          >
            {milestone.title}
          </Text>
          <Text style={styles.time}>{milestone.timeAfterQuit}</Text>
        </View>
        <Text style={styles.description}>{milestone.description}</Text>

        {isCompleted && (
          <View style={styles.benefits}>
            {milestone.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timeline: {
    width: 30,
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDot: {
    backgroundColor: COLORS.primary,
  },
  nextDot: {
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.accentLight,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lineCompleted: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
  lineNext: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completedContent: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primary + '08',
  },
  nextContent: {
    borderColor: COLORS.accentLight,
    backgroundColor: COLORS.accent + '08',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  completedTitle: {
    color: COLORS.primary,
  },
  nextTitle: {
    color: COLORS.accent,
  },
  time: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  benefits: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  benefitIcon: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    marginRight: SPACING.xs,
  },
  benefitText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
});
