import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import {
  HomeScreen,
  ProgressScreen,
  MotivationScreen,
  SettingsScreen,
} from './src/screens';
import { COLORS, FONT_SIZE } from './src/constants/theme';

const Tab = createBottomTabNavigator();

// Tab图标组件
function TabIcon({
  name,
  focused,
}: {
  name: 'home' | 'chart' | 'trophy' | 'settings';
  focused: boolean;
}) {
  const icons: Record<string, string> = {
    home: '🏠',
    chart: '📊',
    trophy: '🏆',
    settings: '⚙️',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name]}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.textSecondary,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabBarLabel,
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
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: FONT_SIZE.sm,
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
