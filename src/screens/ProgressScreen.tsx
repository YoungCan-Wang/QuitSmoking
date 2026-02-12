import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Card, HealthMilestoneItem } from '../components';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { HEALTH_MILESTONES } from '../constants/achievements';
import {
  calculateQuitDuration,
  calculateConsecutiveDays,
  getCurrentHealthMilestones,
  getNextHealthMilestone,
} from '../utils/dateUtils';
import { format, subDays, startOfDay } from 'date-fns';

export function ProgressScreen() {
  const { state } = useApp();
  const { settings, records } = state;

  const duration = calculateQuitDuration(settings.quitDate);
  const consecutiveDays = calculateConsecutiveDays(records);
  const currentMilestones = getCurrentHealthMilestones(duration.days);
  const nextMilestone = getNextHealthMilestone(duration.days);

  // 计算本周记录
  const getWeekData = () => {
    const today = startOfDay(new Date());
    const days: { date: string; dayName: string; status: 'success' | 'fail' | 'none' | 'future' }[] = [];

    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const record = records.find((r) => r.date === dateStr);

      let status: 'success' | 'fail' | 'none' | 'future' = 'none';
      if (date > today) {
        status = 'future';
      } else if (record) {
        status = record.smokedCount === 0 ? 'success' : 'fail';
      }

      days.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        status,
      });
    }

    return days;
  };

  const weekData = getWeekData();

  // 计算进度百分比
  const progressPercent = nextMilestone
    ? Math.min((duration.days / nextMilestone.timeInDays) * 100, 100)
    : 100;

  const renderWeekDay = ({
    item,
    index,
  }: {
    item: { dayName: string; status: string };
    index: number;
  }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'success':
          return COLORS.success;
        case 'fail':
          return COLORS.error;
        case 'future':
          return COLORS.border;
        default:
          return COLORS.textLight;
      }
    };

    return (
      <View style={styles.weekDay}>
        <Text style={styles.weekDayName}>{item.dayName}</Text>
        <View
          style={[
            styles.weekDayDot,
            { backgroundColor: getStatusColor() },
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>戒烟进度</Text>

        {/* 进度卡片 */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>当前进度</Text>
            <Text style={styles.progressDays}>{duration.days}天</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          {nextMilestone ? (
            <Text style={styles.progressText}>
              距离 {nextMilestone.title} 还剩{' '}
              {nextMilestone.timeInDays - duration.days} 天
            </Text>
          ) : (
            <Text style={styles.progressText}>恭喜你已完成所有里程碑！</Text>
          )}
        </Card>

        {/* 统计卡片 */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{consecutiveDays}</Text>
            <Text style={styles.statLabel}>连续戒烟天数</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{records.length}</Text>
            <Text style={styles.statLabel}>总打卡次数</Text>
          </Card>
        </View>

        {/* 本周记录 */}
        <Card style={styles.weekCard}>
          <Text style={styles.sectionTitle}>本周记录</Text>
          <View style={styles.weekContainer}>
            {weekData.map((item, index) => (
              <View key={item.date} style={styles.weekDay}>
                <Text style={styles.weekDayName}>{item.dayName}</Text>
                <View
                  style={[
                    styles.weekDayDot,
                    {
                      backgroundColor:
                        item.status === 'success'
                          ? COLORS.success
                          : item.status === 'fail'
                          ? COLORS.error
                          : item.status === 'future'
                          ? COLORS.border
                          : COLORS.textLight,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.success }]}
              />
              <Text style={styles.legendText}>戒烟成功</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.error }]}
              />
              <Text style={styles.legendText}>有抽烟</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.textLight }]}
              />
              <Text style={styles.legendText}>未记录</Text>
            </View>
          </View>
        </Card>

        {/* 健康时间线 */}
        <Text style={styles.sectionTitle}>健康改善时间线</Text>
        <Card style={styles.timelineCard}>
          {HEALTH_MILESTONES.map((milestone, index) => (
            <HealthMilestoneItem
              key={milestone.id}
              milestone={milestone}
              isCompleted={duration.days >= milestone.timeInDays}
              isNext={
                nextMilestone?.id === milestone.id
              }
            />
          ))}
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
  progressCard: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  progressDays: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  weekCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  weekDay: {
    alignItems: 'center',
  },
  weekDayName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  weekDayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  timelineCard: {
    marginBottom: SPACING.lg,
  },
});
