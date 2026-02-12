# QuitSmoke - 戒烟助手APP 规格文档

## 1. 项目概述

- **项目名称**: QuitSmoke (戒烟助手)
- **项目类型**: React Native 移动应用 (iOS & Android)
- **核心功能**: 帮助用户追踪戒烟进程、提供健康指标激励、计算省钱金额、记录戒烟里程碑
- **目标用户**: 想要戒烟或正在戒烟的烟民

## 2. 技术栈

- **框架**: React Native + Expo
- **语言**: TypeScript
- **状态管理**: React Context + useReducer
- **本地存储**: AsyncStorage
- **图表**: react-native-svg + victory-native
- **动画**: react-native-reanimated
- **导航**: @react-navigation/native + @react-navigation/bottom-tabs

## 3. 功能模块

### 3.1 首页 (Home Screen)
- 超大戒烟天数展示
- 实时戒烟时长计算（天、小时、分钟）
- 今日状态卡片（未抽烟数量、节省金额）
- 快速打卡按钮
- 戒烟宣言/鼓励语展示

### 3.2 进度追踪 (Progress Screen)
- 健康改善时间线（戒烟后身体变化）
- 戒烟进度条
- 本周戒烟记录（日历视图）
- 连续戒烟天数统计
- 复吸记录（可选记录）

### 3.3 激励中心 (Motivation Screen)
- 省钱计算器（根据每日吸烟量/烟价计算）
- 健康收益展示（按时间展示改善的生理指标）
- 成就徽章系统
- 里程碑庆祝动画
- 戒烟动力语录

### 3.4 我的设置 (Settings Screen)
- 个人资料设置
  - 每日吸烟量
  - 香烟价格
  - 戒烟开始日期
- 提醒设置
  - 戒烟提醒开关
  - 克服烟瘾提醒
  - 提醒时间自定义
- 数据管理
  - 导出戒烟数据
  - 重置戒烟记录
- 关于应用

## 4. UI/UX 设计规范

### 4.1 色彩方案
- **主色 (Primary)**: #2E7D32 (森林绿 - 代表健康和生命)
- **次色 (Secondary)**: #81C784 (浅绿 - 辅助色)
- **强调色 (Accent)**: #FF7043 (活力橙 - 用于按钮和徽章)
- **背景色**: #F5F5F5 (浅灰)
- **卡片背景**: #FFFFFF (白色)
- **文字主色**: #212121 (深灰)
- **文字次色**: #757575 (中灰)
- **成功色**: #4CAF50 (绿色)
- **警告色**: #FFC107 (黄色)
- **错误色**: #F44336 (红色)

### 4.2 字体规范
- **标题字体**: System Bold
- **正文字体**: System Regular
- **数字字体**: System Bold (用于统计数据展示)
- **字号**:
  - 戒烟天数: 72px
  - 页面标题: 24px
  - 卡片标题: 18px
  - 正文: 16px
  - 辅助文字: 14px

### 4.3 组件规范
- **卡片**: 圆角 16px，阴影 (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1)
- **按钮**: 圆角 12px，高度 48px
- **图标**: 24px 标准图标
- **间距**: 8px 基础网格

## 5. 数据模型

### 5.1 用户设置 (UserSettings)
```typescript
interface UserSettings {
  dailyCigaretteCount: number;    // 每日吸烟量
  cigarettePrice: number;         // 香烟价格(元/包)
  packSize: number;               // 烟包支数
  quitDate: string;               // 戒烟开始日期 ISO字符串
  reminderEnabled: boolean;      // 提醒开关
  reminderTimes: string[];       // 提醒时间列表
  milestones: Milestone[];       // 已解锁里程碑
}
```

### 5.2 戒烟记录 (QuitRecord)
```typescript
interface QuitRecord {
  date: string;                  // 日期 ISO字符串
  smokedCount: number;           // 当日吸烟数量
  cravingLevel: number;          // 烟瘾强度 1-10
  notes: string;                 // 备注
}
```

### 5.3 成就 (Achievement)
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null;     // 解锁时间
  icon: string;                  // 图标名称
}
```

## 6. 成就系统

### 6.1 里程碑成就
- **第一天**: 成功戒烟1天
- **一周**: 连续戒烟7天
- **一个月**: 连续戒烟30天
- **三个月**: 连续戒烟90天
- **半年**: 连续戒烟180天
- **一年**: 连续戒烟365天

### 6.2 特殊成就
- **初学者**: 完成首次戒烟打卡
- **省钱达人**: 累计节省100元
- **健康达人**: 累计节省1000元
- **意志坚定**: 记录10次烟瘾挑战并坚持

## 7. 健康时间线

戒烟后身体变化（基于医学研究）：
- **20分钟**: 血压和心率恢复正常
- **8小时**: 血液中一氧化碳水平降至正常
- **48小时**: 味觉和嗅觉开始改善
- **2周-3个月**: 肺功能改善30%
- **1-9个月**: 咳嗽和呼吸短促减少
- **1年**: 冠心病风险降至一半
- **5年**: 中风风险降至正常水平
- **10年**: 肺癌风险降低50%
- **15年**: 冠心病风险降至正常

## 8. 页面结构

```
App
├── Tab Navigator
│   ├── Home (首页)
│   │   └── 打卡模态框
│   ├── Progress (进度)
│   │   └── 健康时间线详情
│   ├── Motivation (激励)
│   │   └── 成就详情
│   └── Settings (设置)
│       ├── 个人资料编辑
│       └── 提醒设置
```

## 9. 验收标准

1. ✅ 应用能够正常启动并显示首页
2. ✅ 可以设置个人吸烟信息和戒烟日期
3. ✅ 首页显示正确的戒烟天数和时长
4. ✅ 可以进行戒烟打卡（记录未吸烟）
5. ✅ 省钱计算正确显示累计节省金额
6. ✅ 健康时间线正确展示戒烟后身体变化
7. ✅ 成就系统能够正确解锁和显示徽章
8. ✅ 数据能够持久化存储
9. ✅ iOS 和 Android 双端都能正常运行
