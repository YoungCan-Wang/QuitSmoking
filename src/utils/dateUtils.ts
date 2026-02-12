import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  isToday,
  isYesterday,
  startOfDay,
  parseISO,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { HealthMilestone } from '../types';
import { HEALTH_MILESTONES } from '../constants/achievements';

// 戒烟时长计算
export interface QuitDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function calculateQuitDuration(quitDate: string): QuitDuration {
  const start = parseISO(quitDate);
  const now = new Date();

  const totalSeconds = differenceInSeconds(now, start);
  const days = differenceInDays(now, start);
  const hours = differenceInHours(now, start) % 24;
  const minutes = differenceInMinutes(now, start) % 60;
  const seconds = differenceInSeconds(now, start) % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
}

// 格式化戒烟时长显示
export function formatQuitDuration(duration: QuitDuration): string {
  const { days, hours, minutes, seconds } = duration;

  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟 ${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
}

// 格式化戒烟天数
export function formatQuitDays(days: number): string {
  if (days === 0) {
    return '今天开始戒烟';
  } else if (days === 1) {
    return '戒烟第1天';
  } else if (days < 30) {
    return `戒烟第${days}天`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `戒烟第${months}个月`;
  } else {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) {
      return `戒烟第${years}年`;
    }
    return `戒烟第${years}年${remainingDays}天`;
  }
}

// 计算节省金额
export function calculateSavedMoney(
  dailyCigaretteCount: number,
  cigarettePrice: number,
  packSize: number,
  quitDate: string
): number {
  const days = differenceInDays(new Date(), parseISO(quitDate));
  if (days <= 0) return 0;

  const packsPerDay = dailyCigaretteCount / packSize;
  const moneyPerDay = packsPerDay * cigarettePrice;
  return Math.round(moneyPerDay * days * 100) / 100;
}

// 计算节省的香烟数量
export function calculateSavedCigarettes(
  dailyCigaretteCount: number,
  quitDate: string
): number {
  const days = differenceInDays(new Date(), parseISO(quitDate));
  if (days <= 0) return 0;
  return dailyCigaretteCount * days;
}

// 获取本周戒烟记录
export function getWeekRecords(records: { date: string }[]): (boolean | null)[] {
  const today = startOfDay(new Date());
  const weekDays: (boolean | null)[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');

    const record = records.find((r) => r.date === dateStr);
    if (!date || date > today) {
      weekDays.push(null); // 未来日期
    } else if (record) {
      weekDays.push(record.smokedCount === 0); // 已打卡
    } else {
      weekDays.push(false); // 未打卡（默认视为未戒烟）
    }
  }

  return weekDays;
}

// 格式化日期显示
export function formatDateDisplay(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return '今天';
  } else if (isYesterday(date)) {
    return '昨天';
  } else {
    return format(date, 'MM月dd日', { locale: zhCN });
  }
}

// 获取当前适用的健康里程碑
export function getCurrentHealthMilestones(daysSinceQuit: number): HealthMilestone[] {
  return HEALTH_MILESTONES.filter((milestone) => milestone.timeInDays <= daysSinceQuit);
}

// 获取下一个健康里程碑
export function getNextHealthMilestone(daysSinceQuit: number): HealthMilestone | null {
  const next = HEALTH_MILESTONES.find((milestone) => milestone.timeInDays > daysSinceQuit);
  return next || null;
}

// 计算连续戒烟天数
export function calculateConsecutiveDays(records: { date: string; smokedCount: number }[]): number {
  if (records.length === 0) return 0;

  // 按日期排序
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let consecutiveDays = 0;
  const today = startOfDay(new Date());
  let currentDate = today;

  // 检查今天是否记录
  const todayRecord = sortedRecords.find(
    (r) => r.date === format(today, 'yyyy-MM-dd')
  );

  // 如果今天还没记录，从昨天开始计算
  if (!todayRecord) {
    currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // 连续计算
  for (let i = 0; i < 365; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const record = sortedRecords.find((r) => r.date === dateStr);

    if (record && record.smokedCount === 0) {
      consecutiveDays++;
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return consecutiveDays;
}
