import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Card, AchievementBadge, StatCard } from '../components';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import {
  calculateSavedMoney,
  calculateSavedCigarettes,
  calculateQuitDuration,
  calculateConsecutiveDays,
} from '../utils/dateUtils';
import { MOTIVATIONAL_QUOTES } from '../constants/achievements';

export function MotivationScreen() {
  const { state } = useApp();
  const { settings, records, achievements } = state;

  const [refreshing, setRefreshing] = useState(false);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  const duration = calculateQuitDuration(settings.quitDate);
  const savedMoney = calculateSavedMoney(
    settings.dailyCigaretteCount,
    settings.cigarettePrice,
    settings.packSize,
    settings.quitDate
  );
  const savedCigarettes = calculateSavedCigarettes(
    settings.dailyCigaretteCount,
    settings.quitDate
  );
  const consecutiveDays = calculateConsecutiveDays(records);

  // 解锁的成就
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  // 未解锁的成就
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt);

  // 按类型分组成就
  const dayAchievements = achievements.filter((a) => a.type === 'days');
  const moneyAchievements = achievements.filter((a) => a.type === 'money');
  const recordAchievements = achievements.filter((a) => a.type === 'records');

  const onRefresh = () => {
    setRefreshing(true);
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
    setTimeout(() => setRefreshing(false), 500);
  };

  // 计算到下一个成就的进度
  const getNextAchievementProgress = (
    type: 'days' | 'money' | 'records'
  ): { current: number; target: number; title: string } | null => {
    const filtered = achievements.filter((a) => a.type === type && !a.unlockedAt);
    if (filtered.length === 0) return null;

    const next = filtered.sort(
      (a, b) => a.requirement - b.requirement
    )[0];

    let current = 0;
    if (type === 'days') {
      current = consecutiveDays;
    } else if (type === 'money') {
      current = savedMoney;
    } else {
      current = records.length;
    }

    return {
      current,
      target: next.requirement,
      title: next.title,
    };
  };

  const daysProgress = getNextAchievementProgress('days');
  const moneyProgress = getNextAchievementProgress('money');
  const recordsProgress = getNextAchievementProgress('records');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <Text style={styles.title}>激励中心</Text>

        {/* 鼓励语 */}
        <Card style={styles.quoteCard}>
          <Text style={styles.quoteText}>{quote}</Text>
        </Card>

        {/* 省钱统计 */}
        <Card style={styles.savingsCard}>
          <Text style={styles.savingsTitle}>省钱统计</Text>
          <View style={styles.savingsRow}>
            <View style={styles.savingsItem}>
              <Text style={styles.savingsValue}>¥{savedMoney.toFixed(2)}</Text>
              <Text style={styles.savingsLabel}>已节省金额</Text>
            </View>
            <View style={styles.savingsDivider} />
            <View style={styles.savingsItem}>
              <Text style={styles.savingsValue}>{savedCigarettes}</Text>
              <Text style={styles.savingsLabel}>未吸香烟(支)</Text>
            </View>
          </View>

          {/* 省钱进度 */}
          {moneyProgress && (
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>
                距离下一个成就: {moneyProgress.title}
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(
                        (moneyProgress.current / moneyProgress.target) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {moneyProgress.current} / {moneyProgress.target} 元
              </Text>
            </View>
          )}
        </Card>

        {/* 成就展示 */}
        <Text style={styles.sectionTitle}>成就徽章</Text>

        {/* 基于天数的成就 */}
        <View style={styles.achievementSection}>
          <Text style={styles.achievementTypeTitle}>
            戒烟时长成就
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementRow}
          >
            {dayAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <AchievementBadge
                  achievement={achievement}
                  size="medium"
                />
              </View>
            ))}
          </ScrollView>
          {daysProgress && (
            <View style={styles.progressInfo}>
              <Text style={styles.progressInfoText}>
                距离 {daysProgress.title} 还差{' '}
                {Math.max(daysProgress.target - daysProgress.current, 0)} 天
              </Text>
            </View>
          )}
        </View>

        {/* 基于金钱的成就 */}
        <View style={styles.achievementSection}>
          <Text style={styles.achievementTypeTitle}>省钱成就</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementRow}
          >
            {moneyAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <AchievementBadge
                  achievement={achievement}
                  size="medium"
                />
              </View>
            ))}
          </ScrollView>
          {moneyProgress && (
            <View style={styles.progressInfo}>
              <Text style={styles.progressInfoText}>
                距离 {moneyProgress.title} 还差{' '}
                {Math.max(moneyProgress.target - moneyProgress.current, 0)} 元
              </Text>
            </View>
          )}
        </View>

        {/* 基于记录次数的成就 */}
        <View style={styles.achievementSection}>
          <Text style={styles.achievementTypeTitle}>打卡成就</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementRow}
          >
            {recordAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <AchievementBadge
                  achievement={achievement}
                  size="medium"
                />
              </View>
            ))}
          </ScrollView>
          {recordsProgress && (
            <View style={styles.progressInfo}>
              <Text style={styles.progressInfoText}>
                距离 {recordsProgress.title} 还差{' '}
                {Math.max(recordsProgress.target - recordsProgress.current, 0)} 次
              </Text>
            </View>
          )}
        </View>

        {/* 成就统计 */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>成就进度</Text>
          <View style={styles.statsRow}>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{unlockedAchievements.length}</Text>
              <Text style={styles.statsLabel}>已解锁</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{lockedAchievements.length}</Text>
              <Text style={styles.statsLabel}>未解锁</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>
                {Math.round(
                  (unlockedAchievements.length / achievements.length) * 100
                )}
                %
              </Text>
              <Text style={styles.statsLabel}>完成度</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quoteCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  quoteText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  savingsCard: {
    marginBottom: SPACING.lg,
  },
  savingsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  savingsItem: {
    flex: 1,
    alignItems: 'center',
  },
  savingsValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  savingsLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  savingsDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
  progressSection: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  achievementSection: {
    marginBottom: SPACING.lg,
  },
  achievementTypeTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  achievementRow: {
    paddingRight: SPACING.md,
  },
  achievementItem: {
    marginRight: SPACING.sm,
  },
  progressInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
  },
  progressInfoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    marginTop: SPACING.md,
  },
  statsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statsLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statsDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
});
