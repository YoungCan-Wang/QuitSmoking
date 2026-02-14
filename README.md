# QuitSmoke 戒烟助手

一款帮助烟民戒烟的 React Native 移动应用，支持 iOS 和 Android 双平台。

## 功能特点

### 📱 首页
- 超大戒烟天数展示
- 实时戒烟时长计算（天、小时、分钟）
- **支持选择未来戒烟日期**，提前规划戒烟计划
- 快速打卡功能
- 统计卡片（节省金额、未吸烟数量、连续天数）
- **🆘 SOS紧急求助**：烟瘾犯了？点击播放亲友祝福语音

### 📊 进度追踪
- 戒烟进度条展示
- **本周记录细化分类**：
  - 完美（0支）- 绿色 ✓
  - 偶尔（1-3支）- 浅绿色
  - 控制（4-10支）- 黄色
  - 较多（>10支）- 橙色
- 健康改善时间线

### ⚠️ 危害展示
- 抽烟危害警示（肺部、心血管、口腔等）
- 戒烟好处科普
- 戒烟热线信息

### 🎁 亲友祝福
- **祝福盒功能**：亲友可录制鼓励语音
- **SOS紧急求助**：戒烟者烟瘾犯了时，一键播放随机祝福
- 温暖陪伴，坚定戒烟决心

### 🏆 激励中心
- 省钱计算器
- 成就徽章系统（12个成就）
- 戒烟动力语录

### ⚙️ 设置
- 个人资料管理（每日吸烟量、香烟价格、每包支数）
- **戒烟开始日期/时间**：可选择今天或未来的日期
- 提醒设置
- **祝福盒**：录制和管理亲友祝福语音
- 数据重置

## 技术栈

- **框架**: React Native + Expo
- **语言**: TypeScript
- **状态管理**: React Context + useReducer
- **本地存储**: AsyncStorage + expo-file-system
- **音频**: expo-av
- **导航**: @react-navigation/native

## 项目结构

```
QuitSmoke/
├── src/
│   ├── components/     # UI组件
│   ├── constants/      # 常量配置
│   ├── context/       # 状态管理
│   ├── screens/       # 页面组件
│   ├── services/      # 数据服务（存储、音频）
│   ├── types/         # TypeScript类型
│   └── utils/         # 工具函数
├── android/           # Android原生项目
├── ios/               # iOS原生项目
├── app-icon.png       # APP图标
└── App.tsx           # 应用入口
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发版本

```bash
# 启动Metro开发服务器
npx expo start

# 运行iOS
npx expo run:ios

# 运行Android
npx expo run:android
```

### 构建Release版本

```bash
# Android
cd android
./gradlew assembleRelease

# 生成的APK位于: android/app/build/outputs/apk/release/app-release.apk
```

## 下载安装

最新的独立运行版APK可直接安装使用，无需连接开发服务器：

- [QuitSmoke-v2.2.1.apk](./QuitSmoke-v2.2.1.apk)

## 数据说明

- 所有数据存储在本地设备
- 祝福语音保存在应用私有目录
- 支持数据导出和重置

## 版本历史

- **v2.2.1**: 修复录音保存问题
- **v2.2.0**: 支持选择未来戒烟日期，优化首页显示
- **v2.1.0**: 新增APP图标，亲友祝福功能
- **v2.0.0**: 新增危害展示页面，优化底部导航
- **v1.x**: 基础功能（打卡、进度追踪、成就系统）

## 许可证

MIT License
