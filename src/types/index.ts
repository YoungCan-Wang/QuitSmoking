// 用户设置
export interface UserSettings {
  dailyCigaretteCount: number;
  cigarettePrice: number;
  packSize: number;
  quitDate: string;
  reminderEnabled: boolean;
  reminderTimes: string[];
  hasCompletedOnboarding: boolean;
}

// 戒烟记录
export interface QuitRecord {
  date: string;
  smokedCount: number;
  cravingLevel: number;
  notes: string;
  timestamp: number;
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null;
  icon: string;
  requirement: number;
  type: 'days' | 'money' | 'records';
}

// 健康里程碑
export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeAfterQuit: string;
  timeInDays: number;
  benefits: string[];
}

// 祝福语音
export interface VoiceBlessing {
  id: string;
  speakerName: string;
  filePath: string;
  durationMs: number;
  createdAt: string;
}

// 应用状态
export interface AppState {
  settings: UserSettings;
  records: QuitRecord[];
  achievements: Achievement[];
  blessings: VoiceBlessing[];
  isLoading: boolean;
}

// 操作类型
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { settings: UserSettings; records: QuitRecord[]; achievements: Achievement[]; blessings: VoiceBlessing[] } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'ADD_RECORD'; payload: QuitRecord }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_BLESSING'; payload: VoiceBlessing }
  | { type: 'DELETE_BLESSING'; payload: string }
  | { type: 'RESET_DATA' };
