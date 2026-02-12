import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Card, Button, StatCard } from '../components';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import {
  calculateQuitDuration,
  formatQuitDuration,
  formatQuitDays,
  calculateSavedMoney,
  calculateSavedCigarettes,
  calculateConsecutiveDays,
} from '../utils/dateUtils';
import { format } from 'date-fns';
import { MOTIVATIONAL_QUOTES } from '../constants/achievements';

export function HomeScreen() {
  const { state, addRecord, updateSettings } = useApp();
  const { settings, records } = state;

  const [refreshing, setRefreshing] = useState(false);
  const [duration, setDuration] = useState(calculateQuitDuration(settings.quitDate));
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [todayRecord, setTodayRecord] = useState<{
    smokedCount: number;
    cravingLevel: number;
    notes: string;
  }>({ smokedCount: 0, cravingLevel: 5, notes: '' });

  const [quote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  });

  // 更新戒烟时长
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(calculateQuitDuration(settings.quitDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.quitDate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setDuration(calculateQuitDuration(settings.quitDate));
    setTimeout(() => setRefreshing(false), 500);
  }, [settings.quitDate]);

  // 检查今天是否已打卡
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const hasCheckedInToday = records.some((r) => r.date === todayStr);

  // 计算统计数据
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

  const handleCheckIn = async () => {
    try {
      await addRecord({
        date: todayStr,
        smokedCount: todayRecord.smokedCount,
        cravingLevel: todayRecord.cravingLevel,
        notes: todayRecord.notes,
      });
      setShowCheckInModal(false);
      Alert.alert('打卡成功', '今天你成功戒烟了！继续保持！');
    } catch (error) {
      Alert.alert('打卡失败', '请重试');
    }
  };

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
        {/* 戒烟天数展示 */}
        <View style={styles.daysContainer}>
          <Text style={styles.daysNumber}>{duration.days}</Text>
          <Text style={styles.daysLabel}>天</Text>
        </View>
        <Text style={styles.statusText}>{formatQuitDays(duration.days)}</Text>

        {/* 戒烟时长详情 */}
        <Card style={styles.durationCard}>
          <Text style={styles.durationTitle}>戒烟时长</Text>
          <Text style={styles.durationValue}>
            {formatQuitDuration(duration)}
          </Text>
        </Card>

        {/* 打卡按钮 */}
        <TouchableOpacity
          style={[
            styles.checkInButton,
            hasCheckedInToday && styles.checkInButtonDone,
          ]}
          onPress={() => setShowCheckInModal(true)}
          disabled={hasCheckedInToday}
        >
          <Text style={styles.checkInButtonText}>
            {hasCheckedInToday ? '今日已完成打卡' : '今日打卡'}
          </Text>
        </TouchableOpacity>

        {/* 统计卡片 */}
        <View style={styles.statsRow}>
          <StatCard
            title="节省金额"
            value={`¥${savedMoney.toFixed(2)}`}
            subtitle="累计节省"
            color={COLORS.primary}
          />
          <View style={styles.statSpacer} />
          <StatCard
            title="未吸烟"
            value={`${savedCigarettes}`}
            subtitle="累计支"
            color={COLORS.accent}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="连续戒烟"
            value={`${consecutiveDays}`}
            subtitle="天"
            color={COLORS.primaryLight}
          />
          <View style={styles.statSpacer} />
          <StatCard
            title="戒烟次数"
            value={`${records.length}`}
            subtitle="次打卡"
            color={COLORS.secondary}
          />
        </View>

        {/* 鼓励语 */}
        <Card style={styles.quoteCard}>
          <Text style={styles.quoteText}>{quote}</Text>
        </Card>
      </ScrollView>

      {/* 打卡模态框 */}
      <Modal
        visible={showCheckInModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>今日打卡</Text>
            <Text style={styles.modalSubtitle}>
              恭喜你又坚持了一天！
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>今天抽烟了吗？</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    todayRecord.smokedCount === 0 && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setTodayRecord({ ...todayRecord, smokedCount: 0 })
                  }
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      todayRecord.smokedCount === 0 &&
                        styles.toggleButtonTextActive,
                    ]}
                  >
                    没有抽烟
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    todayRecord.smokedCount > 0 && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setTodayRecord({ ...todayRecord, smokedCount: 1 })
                  }
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      todayRecord.smokedCount > 0 &&
                        styles.toggleButtonTextActive,
                    ]}
                  >
                    抽了
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {todayRecord.smokedCount > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>抽烟数量</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(todayRecord.smokedCount)}
                  onChangeText={(text) =>
                    setTodayRecord({
                      ...todayRecord,
                      smokedCount: parseInt(text) || 0,
                    })
                  }
                  placeholder="0"
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button
                title="取消"
                variant="outline"
                onPress={() => setShowCheckInModal(false)}
                style={styles.modalButton}
              />
              <Button
                title="确认打卡"
                onPress={handleCheckIn}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  daysNumber: {
    fontSize: FONT_SIZE.giant,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  daysLabel: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  durationCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  durationTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  durationValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  checkInButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkInButtonDone: {
    backgroundColor: COLORS.success,
  },
  checkInButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  statSpacer: {
    width: SPACING.md,
  },
  quoteCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  quoteText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  toggleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  toggleButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  toggleButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtons: {
    flexDirection: 'row',
marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});
