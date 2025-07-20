import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@styles/colors';
import { isWeb, isDesktop } from '@/utils/platform';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

// Web desktop sidebar navigation
const WebSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/journal', label: 'Journal', icon: 'book' },
    { path: '/insights', label: 'Insights', icon: 'analytics' },
    { path: '/chat', label: 'Luna Chat', icon: 'chatbubble-ellipses' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={styles.sidebar}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>🌙 Luna</Text>
      </View>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Pressable
            key={item.path}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => router.push(item.path as any)}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={isActive ? colors.primary.pink : colors.neutral.gray}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  // Use sidebar for web desktop
  if (isWeb && isDesktop) {
    return (
      <>
        <WebSidebar />
        <View style={styles.desktopContent}>
          <Tabs
            screenOptions={{
              tabBarStyle: { display: 'none' },
              headerStyle: {
                backgroundColor: colors.neutral.white,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: colors.neutral.lightGray,
              },
              headerTintColor: colors.neutral.black,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
            <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
            <Tabs.Screen name="chat" options={{ title: 'Luna Chat' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
          </Tabs>
        </View>
      </>
    );
  }

  // Default mobile/tablet tabs
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.pink,
        tabBarInactiveTintColor: colors.neutral.gray,
        tabBarStyle: {
          backgroundColor: colors.neutral.white,
          borderTopColor: colors.neutral.lightGray,
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.neutral.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral.lightGray,
        },
        headerTintColor: colors.neutral.black,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'fixed' as any,
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: colors.neutral.white,
    borderRightWidth: 1,
    borderRightColor: colors.neutral.lightGray,
    paddingTop: 24,
    zIndex: 100,
  },
  logo: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.pink,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: colors.primary.pink + '15',
  },
  navLabel: {
    marginLeft: 16,
    fontSize: 16,
    color: colors.neutral.gray,
  },
  navLabelActive: {
    color: colors.primary.pink,
    fontWeight: '600',
  },
  desktopContent: {
    flex: 1,
    marginLeft: 280,
  },
});