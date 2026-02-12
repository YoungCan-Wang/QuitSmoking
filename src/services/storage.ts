import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, QuitRecord, Achievement } from '../types';
import { DEFAULT_SETTINGS } from '../constants/theme';
import { ACHIEVEMENTS } from '../constants/achievements';

const STORAGE_KEYS = {
  SETTINGS: '@quitsmoke_settings',
  RECORDS: '@quitsmoke_records',
  ACHIEVEMENTS: '@quitsmoke_achievements',
};

export const StorageService = {
  // 保存用户设置
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  },

  // 加载用户设置
  async loadSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('加载设置失败:', error);
      return DEFAULT_SETTINGS;
    }
  },

  // 保存戒烟记录
  async saveRecords(records: QuitRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (error) {
      console.error('保存记录失败:', error);
      throw error;
    }
  },

  // 加载戒烟记录
  async loadRecords(): Promise<QuitRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('加载记录失败:', error);
      return [];
    }
  },

  // 保存成就
  async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (error) {
      console.error('保存成就失败:', error);
      throw error;
    }
  },

  // 加载成就
  async loadAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        return JSON.parse(data);
      }
      return [...ACHIEVEMENTS];
    } catch (error) {
      console.error('加载成就失败:', error);
      return [...ACHIEVEMENTS];
    }
  },

  // 重置所有数据
  async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.RECORDS,
        STORAGE_KEYS.ACHIEVEMENTS,
      ]);
    } catch (error) {
      console.error('重置数据失败:', error);
      throw error;
    }
  },

  // 导出所有数据
  async exportAllData(): Promise<{
    settings: UserSettings;
    records: QuitRecord[];
    achievements: Achievement[];
  }> {
    const [settings, records, achievements] = await Promise.all([
      this.loadSettings(),
      this.loadRecords(),
      this.loadAchievements(),
    ]);

    return { settings, records, achievements };
  },
};
