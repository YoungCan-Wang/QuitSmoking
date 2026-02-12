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

// 抽烟等级分类
type SmokeLevel = 'none' | 'perfect' | 'light' | 'medium' | 'heavy' | 'future' | 'unrecorded';

interface WeekDayData {
  date: string;
  dayName: string;
  smokeLevel: SmokeLevel;
  smokedCount: number;
}

// 根据抽烟数量获取等级和颜色
const getSmokeLevel = (count: number, isFuture: boolean): { level: SmokeLevel; color: string; label: string } => {
  if (isFuture) {
    return { level: 'future', color: COLORS.border, label: '未到来' };
  }
  if (count === 0) {
    return { level: 'perfect', color: '#4CAF50', label: '完美' };
  } else if (count <= 3) {
    return { level: 'light', color: '#8BC34A', label: '偶尔' };
  } else if (count <= 10) {
    return { level: 'medium', color: '#FFC107', label: '控制' };
  } else if (count <= 20) {
    return { level: 'heavy', color: '#FF9800', label: '较多' };
  } else {
    return { level: 'heavy', color: '#F44336', label: '大量' };
  }
};

// 计算本周记录
const getWeekData = (records: { date: string; smokedCount: number }[]): WeekDayData[] => {
  const today = startOfDay(new Date());
  const days: WeekDayData[] = [];

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = records.find((r) => r.date === dateStr);

    const isFuture = date > today;
    const smokedCount = record?.smokedCount ?? -1; // -1表示未记录
    const { level } = getSmokeLevel(smokedCount, isFuture);

    days.push({
      date: dateStr,
      dayName: dayNames[date.getDay()],
      smokeLevel: isFuture ? 'future' : (smokedCount === -1 ? 'unrecorded' : (smokedCount === 0 ? 'perfect' : smokedCount <= 3 ? 'light' : smokedCount <= 10 ? 'medium' : 'heavy')),
      smokedCount: smokedCount,
    });
  }

  return days;
};

const weekData = getWeekData(records);

// 获取抽烟等级颜色
const getSmokeLevelColor = (level: SmokeLevel): string => {
  switch (level) {
    case 'perfect': return '#4CAF50';
    case 'light': return '#8BC34A';
    case 'medium': return '#FFC107';
    case 'heavy': return '#FF5722';
    case 'unrecorded': return COLORS.textLight;
    case 'future': return COLORS.border;
    default: return COLORS.textLight;
  }
};

// 获取抽烟等级显示文本
const getSmokeLevelText = (level: SmokeLevel, count: number): string => {
  switch (level) {
    case 'perfect': return '✓';
    case 'light': return `${count}`;
    case 'medium': return `${count}`;
    case 'heavy': return `${count}`;
    case 'unrecorded': return '-';
    case 'future': return '';
    default: return '';
  }
};

  // 计算进度百分比
  const progressPercent = nextMilestone
    ? Math.min((duration.days / nextMilestone.timeInDays) * 100, 100)
    : 100;

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
            {weekData.map((item) => (
              <View key={item.date} style={styles.weekDay}>
                <Text style={styles.weekDayName}>{item.dayName}</Text>
                <View
                  style={[
                    styles.weekDayDot,
                    { backgroundColor: getSmokeLevelColor(item.smokeLevel) },
                  ]}
                >
                  <Text style={styles.weekDayCount}>
                    {getSmokeLevelText(item.smokeLevel, item.smokedCount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* 图例说明 */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>完美(0支)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8BC34A' }]} />
              <Text style={styles.legendText}>偶尔(1-3支)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
              <Text style={styles.legendText}>控制(4-10支)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
              <Text style={styles.legendText}>较多(>10支)</Text>
            </View>
          </View>
          
          <View style={styles.legendSecondRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.textLight }]} />
              <Text style={styles.legendText}>未记录</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.border }]} />
              <Text style={styles.legendText}>未到来</Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayCount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendSecondRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
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
