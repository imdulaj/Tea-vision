import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Sprout, BarChart2, LayoutDashboard, Bug, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Theme';

import HomeScreen from '../screens/HomeScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import MarketAnalyzerScreen from '../screens/MarketAnalyzerScreen';
import SoilStackNavigator from './SoilStackNavigator'; // ✅ NEW IMPORT

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            elevation: 5,
            backgroundColor: COLORS.white,
            borderRadius: 30,
            height: 70,
            borderTopWidth: 0,
            ...styles.shadow,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <LayoutDashboard
                  color={focused ? COLORS.white : COLORS.textLight}
                  size={focused ? 28 : 24}
                />
              </View>
            ),
          }}
        />

        {/* 🌱 SOIL TAB → STACK */}
        <Tab.Screen
          name="Soil"
          component={SoilStackNavigator} // ✅ STACK HERE
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Sprout
                  color={focused ? COLORS.white : COLORS.textLight}
                  size={focused ? 28 : 24}
                />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="DiseaseDetection"
          component={DiseaseDetectionScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Bug
                  color={focused ? COLORS.white : COLORS.textLight}
                  size={focused ? 28 : 24}
                />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="MarketAnalyzer"
          component={MarketAnalyzerScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <BarChart2
                  color={focused ? COLORS.white : COLORS.textLight}
                  size={focused ? 28 : 24}
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>

      {/* 🌍 GLOBAL CHATBOT FAB */}
      {/* 🌍 GLOBAL CHATBOT FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SoilChatbot')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.fabGradient}
        >
          <MessageCircle size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
    marginBottom: 25,
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Positioned above the tab bar (70 height + 20 bottom margin)
    right: 20,
    zIndex: 100,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderRadius: 30,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabNavigator;
