import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { format, parseISO } from 'date-fns';

export function SettingsScreen() {
  const { state, updateSettings, resetData } = useApp();
  const { settings } = state;

  const [dailyCigaretteCount, setDailyCigaretteCount] = useState(
    String(settings.dailyCigaretteCount)
  );
  const [cigarettePrice, setCigarettePrice] = useState(
    String(settings.cigarettePrice)
  );
  const [packSize, setPackSize] = useState(String(settings.packSize));
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        dailyCigaretteCount: parseInt(dailyCigaretteCount) || 20,
        cigarettePrice: parseFloat(cigarettePrice) || 25,
        packSize: parseInt(packSize) || 20,
      });
      Alert.alert('保存成功', '您的设置已保存');
    } catch (error) {
      Alert.alert('保存失败', '请重试');
    }
  };

  const handleReminderToggle = async (value: boolean) => {
    setReminderEnabled(value);
    await updateSettings({ reminderEnabled: value });
  };

  const handleResetData = () => {
    Alert.alert(
      '重置数据',
      '确定要重置所有数据吗？这将清除您所有的戒烟记录和成就。此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetData();
              Alert.alert('重置成功', '所有数据已重置');
            } catch (error) {
              Alert.alert('重置失败', '请重试');
            }
          },
        },
      ]
    );
  };

  const formatQuitDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'yyyy年MM月dd日');
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>设置</Text>

        {/* 个人资料 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>个人资料</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>戒烟开始日期</Text>
            <Text style={styles.settingValue}>
              {formatQuitDate(settings.quitDate)}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>每日吸烟量（支）</Text>
            <TextInput
              style={styles.input}
              value={dailyCigaretteCount}
              onChangeText={setDailyCigaretteCount}
              keyboardType="numeric"
              placeholder="20"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>香烟价格（元/包）</Text>
            <TextInput
              style={styles.input}
              value={cigarettePrice}
              onChangeText={setCigarettePrice}
              keyboardType="decimal-pad"
              placeholder="25"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>每包支数</Text>
            <TextInput
              style={styles.input}
              value={packSize}
              onChangeText={setPackSize}
              keyboardType="numeric"
              placeholder="20"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <Button
            title="保存设置"
            onPress={handleSaveSettings}
            style={styles.saveButton}
          />
        </Card>

        {/* 提醒设置 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>提醒设置</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>开启戒烟提醒</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={reminderEnabled ? COLORS.primary : COLORS.textLight}
              />
            </View>
          </View>

          <Text style={styles.settingDescription}>
            开启后，系统会在设定的时间提醒您坚持戒烟
          </Text>
        </Card>

        {/* 数据管理 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetData}
          >
            <Text style={styles.dangerButtonText}>重置所有数据</Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            重置后将清除所有戒烟记录、成就和设置，此操作不可恢复
          </Text>
        </Card>

        {/* 关于应用 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>关于应用</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>应用名称</Text>
            <Text style={styles.settingValue}>戒烟助手</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>版本号</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>应用简介</Text>
            <Text style={styles.aboutText}>
              戒烟助手是一款帮助用户戒烟的健康管理应用。我们致力于通过科学的方法和温暖的陪伴，帮助每一位用户成功戒烟，收获更健康的生活方式。
            </Text>
          </View>
        </Card>

        {/* 健康提示 */}
        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>健康提示</Text>
          <Text style={styles.tipText}>
            戒烟是对自己和家人健康的负责。根据研究，戒烟后身体会开始逐步恢复：
          </Text>
          <Text style={styles.tipItem}>• 20分钟后：血压和心率恢复正常</Text>
          <Text style={styles.tipItem}>• 8小时后：血液中一氧化碳水平正常</Text>
          <Text style={styles.tipItem}>• 2周-3个月：肺功能改善30%</Text>
          <Text style={styles.tipItem}>• 1年后：冠心病风险降低50%</Text>
          <Text style={styles.tipItem}>• 10年后：肺癌风险降低50%</Text>
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
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingItem: {
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  settingDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  saveButton: {
    marginTop: SPACING.sm,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dangerButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  warningText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  tipTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});
