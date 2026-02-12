import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, UserSettings, QuitRecord, Achievement } from '../types';
import { DEFAULT_SETTINGS } from '../constants/theme';
import { ACHIEVEMENTS } from '../constants/achievements';
import { StorageService } from '../services/storage';
import { differenceInDays, parseISO, format } from 'date-fns';
import { calculateSavedMoney, calculateConsecutiveDays } from '../utils/dateUtils';

const initialState: AppState = {
  settings: DEFAULT_SETTINGS,
  records: [],
  achievements: [...ACHIEVEMENTS],
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_DATA':
      return {
        ...state,
        settings: action.payload.settings,
        records: action.payload.records,
        achievements: action.payload.achievements,
        isLoading: false,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'ADD_RECORD':
      return {
        ...state,
        records: [...state.records, action.payload],
      };

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map((achievement) =>
          achievement.id === action.payload
            ? { ...achievement, unlockedAt: new Date().toISOString() }
            : achievement
        ),
      };

    case 'RESET_DATA':
      return {
        ...initialState,
        isLoading: false,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  addRecord: (record: Omit<QuitRecord, 'timestamp'>) => Promise<void>;
  resetData: () => Promise<void>;
  checkAndUnlockAchievements: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settings, records, achievements] = await Promise.all([
        StorageService.loadSettings(),
        StorageService.loadRecords(),
        StorageService.loadAchievements(),
      ]);

      dispatch({
        type: 'LOAD_DATA',
        payload: { settings, records, achievements },
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    await StorageService.saveSettings(updatedSettings);
  };

  const addRecord = async (record: Omit<QuitRecord, 'timestamp'>) => {
    const newRecord: QuitRecord = {
      ...record,
      timestamp: Date.now(),
    };

    dispatch({ type: 'ADD_RECORD', payload: newRecord });
    await StorageService.saveRecords([...state.records, newRecord]);

    // 检查并解锁成就
    await checkAndUnlockAchievements();
  };

  const checkAndUnlockAchievements = async () => {
    const daysSinceQuit = differenceInDays(
      new Date(),
      parseISO(state.settings.quitDate)
    );
    const consecutiveDays = calculateConsecutiveDays(state.records);
    const savedMoney = calculateSavedMoney(
      state.settings.dailyCigaretteCount,
      state.settings.cigarettePrice,
      state.settings.packSize,
      state.settings.quitDate
    );

    const newAchievements = [...state.achievements];

    // 检查基于天数的成就
    for (const achievement of newAchievements) {
      if (achievement.unlockedAt) continue;

      if (achievement.type === 'days' && consecutiveDays >= achievement.requirement) {
        achievement.unlockedAt = new Date().toISOString();
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement.id });
      }

      if (achievement.type === 'money' && savedMoney >= achievement.requirement) {
        achievement.unlockedAt = new Date().toISOString();
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement.id });
      }

      if (achievement.type === 'records' && state.records.length >= achievement.requirement) {
        achievement.unlockedAt = new Date().toISOString();
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement.id });
      }
    }

    await StorageService.saveAchievements(newAchievements);
  };

  const resetData = async () => {
    dispatch({ type: 'RESET_DATA' });
    await StorageService.resetAllData();
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updateSettings,
        addRecord,
        resetData,
        checkAndUnlockAchievements,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
