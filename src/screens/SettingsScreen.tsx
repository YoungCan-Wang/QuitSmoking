import React, { useState, useRef } from 'react';
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
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { format, parseISO } from 'date-fns';
import { recordAudio, stopRecording, playAudio, stopAudio, formatDuration, deleteBlessingFile, VoiceBlessing } from '../services/audioService';
import { Audio } from 'expo-av';

export function SettingsScreen() {
  const { state, updateSettings, resetData, addBlessing, deleteBlessing } = useApp();
  const { settings, blessings } = state;

  const [dailyCigaretteCount, setDailyCigaretteCount] = useState(
    String(settings.dailyCigaretteCount)
  );
  const [cigarettePrice, setCigarettePrice] = useState(
    String(settings.cigarettePrice)
  );
  const [packSize, setPackSize] = useState(String(settings.packSize));
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled);
  
  // 日期时间选择器状态
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempQuitDate, setTempQuitDate] = useState(parseISO(settings.quitDate));

  // 祝福录音状态
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [speakerName, setSpeakerName] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        dailyCigaretteCount: parseInt(dailyCigaretteCount) || 20,
        cigarettePrice: parseFloat(cigarettePrice) || 25,
        packSize: parseInt(packSize) || 20,
        quitDate: tempQuitDate.toISOString(),
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

  // 处理日期选择
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      // 保留当前选择的时间，只更改日期
      const newDate = new Date(tempQuitDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setTempQuitDate(newDate);
    }
  };

  // 处理时间选择
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      // 保留当前选择的日期，只更改时间
      const newDate = new Date(tempQuitDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setTempQuitDate(newDate);
    }
  };

  const formatQuitDateTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'yyyy年MM月dd日 HH:mm');
    } catch {
      return dateStr;
    }
  };

  // 开始录音
  const handleStartRecording = async () => {
    try {
      const rec = await recordAudio();
      if (rec) {
        setRecording(rec);
        setIsRecording(true);
        setRecordingDuration(0);
        
        // 更新录音时长
        const interval = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        
        // 保存interval引用以便清除
        (rec as any).interval = interval;
      } else {
        Alert.alert('录音失败', '无法启动录音，请确保已授予麦克风权限');
      }
    } catch (error) {
      console.error('录音错误:', error);
      Alert.alert('录音失败', '请检查麦克风权限是否已授予');
    }
  };

  // 停止录音
  const handleStopRecording = async () => {
    if (!recording) {
      console.log('[录音] 没有录音对象，返回');
      Alert.alert('错误', '录音对象不存在');
      return;
    }

    try {
      console.log('[录音] 开始停止录音流程...');
      console.log('[录音] speakerName:', speakerName.trim() || '亲友');
      
      // 清除计时器
      const interval = (recording as any).interval;
      if (interval) clearInterval(interval);

      console.log('[录音] 调用 stopRecording...');
      const blessing = await stopRecording(recording, speakerName.trim() || '亲友');
      console.log('[录音] stopRecording 返回结果:', blessing);
      
      if (blessing) {
        console.log('[录音] 调用 addBlessing 保存到存储...');
        console.log('[录音] 当前 blessings 数量:', blessings.length);
        await addBlessing(blessing);
        console.log('[录音] addBlessing 完成');
        Alert.alert('录制成功', '祝福语音已保存');
      } else {
        console.log('[录音] blessing 为空，保存失败');
        Alert.alert('保存失败', 'stopRecording 返回空结果，请查看控制台日志');
      }
      
      setIsRecording(false);
      setRecording(null);
      setSpeakerName('');
      setShowRecordingModal(false);
      console.log('[录音] 停止录音流程结束');
    } catch (error) {
      console.error('[录音] 保存录音错误:', error);
      Alert.alert('保存失败', `错误详情: ${error instanceof Error ? error.message : String(error)}`);
      setIsRecording(false);
    }
  };

  // 播放祝福语音
  const handlePlayBlessing = async (blessing: VoiceBlessing) => {
    try {
      // 停止当前播放
      if (soundRef.current) {
        await stopAudio(soundRef.current);
      }

      setIsPlaying(true);
      setCurrentPlayingId(blessing.id);
      
      const sound = await playAudio(blessing.filePath);
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
      });
    } catch (error) {
      Alert.alert('播放失败', '无法播放该祝福');
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  // 停止播放
  const handleStopPlaying = async () => {
    if (soundRef.current) {
      await stopAudio(soundRef.current);
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingId(null);
  };

  // 删除祝福
  const handleDeleteBlessing = (blessing: VoiceBlessing) => {
    Alert.alert(
      '删除祝福',
      `确定要删除${blessing.speakerName}的祝福吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteBlessingFile(blessing.filePath);
            await deleteBlessing(blessing.id);
          },
        },
      ]
    );
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

          {/* 戒烟开始日期时间 */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>戒烟开始日期</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {format(tempQuitDate, 'yyyy年MM月dd日')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>戒烟开始时间</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {format(tempQuitDate, 'HH:mm')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.currentDateInfo}>
            <Text style={styles.currentDateLabel}>当前戒烟开始时间：</Text>
            <Text style={styles.currentDateValue}>
              {formatQuitDateTime(settings.quitDate)}
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

        {/* 日期选择器 - Android原生选择器 */}
        {showDatePicker && (
          <DateTimePicker
            value={tempQuitDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)}
            onChange={(event, date) => {
              if (Platform.OS === 'ios') {
                if (event.type === 'set' && date) {
                  handleDateChange(event, date);
                }
              } else {
                handleDateChange(event, date);
              }
              if (Platform.OS === 'ios') {
                setShowDatePicker(false);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={tempQuitDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, time) => {
              if (Platform.OS === 'ios') {
                if (event.type === 'set' && time) {
                  handleTimeChange(event, time);
                }
              } else {
                handleTimeChange(event, time);
              }
              if (Platform.OS === 'ios') {
                setShowTimePicker(false);
              }
            }}
          />
        )}

        {/* iOS上的确定按钮 */}
        {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
          <View style={styles.pickerConfirm}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        )}

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

        {/* 祝福盒 - 亲友录音 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>祝福盒 🎁</Text>
          <Text style={styles.settingDescription}>
            录制亲友祝福语音，让戒烟者在坚持不住时听到家人的鼓励
          </Text>

          {/* 已有祝福列表 */}
          {blessings.length > 0 && (
            <View style={styles.blessingsList}>
              {blessings.map((blessing) => (
                <View key={blessing.id} style={styles.blessingItem}>
                  <View style={styles.blessingInfo}>
                    <Text style={styles.blessingName}>{blessing.speakerName}</Text>
                    <Text style={styles.blessingDuration}>
                      {formatDuration(blessing.durationMs)}
                    </Text>
                  </View>
                  <View style={styles.blessingActions}>
                    {isPlaying && currentPlayingId === blessing.id ? (
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={handleStopPlaying}
                      >
                        <Text style={styles.playButtonText}>⏹</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handlePlayBlessing(blessing)}
                      >
                        <Text style={styles.playButtonText}>▶️</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteBlessing(blessing)}
                    >
                      <Text style={styles.deleteButtonText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 添加祝福按钮 */}
          <TouchableOpacity
            style={styles.addBlessingButton}
            onPress={() => setShowRecordingModal(true)}
          >
            <Text style={styles.addBlessingButtonText}>➕ 录制新祝福</Text>
          </TouchableOpacity>
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

        {/* 录音模态框 */}
        <Modal
          visible={showRecordingModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRecordingModal(false)}
        >
          <View style={styles.recordingModalOverlay}>
            <View style={styles.recordingModalContent}>
              <Text style={styles.recordingModalTitle}>录制祝福语音</Text>
              
              {/* 录音状态显示 */}
              <View style={styles.recordingStatus}>
                {isRecording ? (
                  <>
                    <View style={styles.recordingIndicator}>
                      <Text style={styles.recordingDot}>🔴</Text>
                      <Text style={styles.recordingText}>正在录音...</Text>
                    </View>
                    <Text style={styles.recordingDuration}>
                      {formatDuration(recordingDuration * 1000)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.recordingHint}>
                    点击下方按钮开始录制
                  </Text>
                )}
              </View>

              {/* 说话人名称输入 */}
              <View style={styles.speakerNameInput}>
                <Text style={styles.inputLabel}>录制人称呼（如：妈妈、老婆）</Text>
                <TextInput
                  style={styles.input}
                  value={speakerName}
                  onChangeText={setSpeakerName}
                  placeholder="请输入称呼"
                  placeholderTextColor={COLORS.textLight}
                  maxLength={20}
                />
              </View>

              {/* 录音控制按钮 */}
              <View style={styles.recordingControls}>
                {isRecording ? (
                  <TouchableOpacity
                    style={styles.stopRecordingButton}
                    onPress={handleStopRecording}
                  >
                    <Text style={styles.stopRecordingText}>⏹ 停止录音</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.startRecordingButton}
                    onPress={handleStartRecording}
                  >
                    <Text style={styles.startRecordingText}>🎤 开始录音</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.cancelRecordingButton}
                  onPress={() => {
                    setShowRecordingModal(false);
                    setSpeakerName('');
                  }}
                >
                  <Text style={styles.cancelRecordingText}>取消</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  dateButton: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  currentDateInfo: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  currentDateLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  currentDateValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pickerConfirm: {
    position: 'absolute',
    top: 100,
    right: SPACING.md,
    zIndex: 1000,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '600',
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
  // 祝福盒样式
  blessingsList: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  blessingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  blessingInfo: {
    flex: 1,
  },
  blessingName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  blessingDuration: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  blessingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  playButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  addBlessingButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addBlessingButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  // 录音模态框样式
  recordingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  recordingModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
  },
  recordingModalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    minHeight: 80,
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recordingDot: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  recordingText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.error,
    fontWeight: '600',
  },
  recordingDuration: {
    fontSize: FONT_SIZE.giant,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recordingHint: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  speakerNameInput: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  recordingControls: {
    width: '100%',
  },
  startRecordingButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  startRecordingText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  stopRecordingButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stopRecordingText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  cancelRecordingButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelRecordingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
});
