import React from 'react';
import { StatusBar, StyleSheet } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, StyleSheet as RNStyleSheet } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import {
  HomeScreen,
  ProgressScreen,
  MotivationScreen,
  SettingsScreen,
  FearFactorScreen,
} from './src/screens';
import { COLORS, FONT_SIZE, SPACING } from './src/constants/theme';

const Tab = createBottomTabNavigator();

// Tab图标组件
function TabIcon({
  name,
  focused,
}: {
  name: 'home' | 'chart' | 'trophy' | 'settings' | 'warning';
  focused: boolean;
}) {
  const icons: Record<string, string> = {
    home: '🏠',
    chart: '📊',
    trophy: '🏆',
    settings: '⚙️',
    warning: '😰',
  };

  return (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>
      {icons[name]}
    </Text>
  );
}

// 带安全区域的底部Tab导航
function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          // 确保底部安全区域正确应用到TabBar
          paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.sm,
          height: 70 + (insets.bottom > 0 ? insets.bottom : SPACING.sm),
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.sm,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: '进度',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="chart" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Motivation"
        component={MotivationScreen}
        options={{
          tabBarLabel: '激励',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="trophy" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="FearFactor"
        component={FearFactorScreen}
        options={{
          tabBarLabel: '危害',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="warning" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '设置',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: COLORS.background,
            },
          }}
        >
          <StatusBar style="dark" />
          <TabNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = RNStyleSheet.create({
});
