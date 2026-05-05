import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Sprout, BarChart2, LayoutDashboard, Bug, ShoppingBag, User, CloudRain } from 'lucide-react-native';
import { COLORS } from '../constants/Theme';

import HomeScreen from '../screens/HomeScreen';
import SoilAnalyzerScreen from '../screens/SoilAnalyzerScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import MarketAnalyzerScreen from '../screens/MarketAnalyzerScreen';
import BiddingScreen from '../screens/BiddingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false, // Only icons
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    left: 15, // Slightly wider to fit 7 tabs comfortably
                    right: 15,
                    elevation: 5,
                    backgroundColor: COLORS.white,
                    borderRadius: 30, // Round sides
                    height: 70,
                    paddingBottom: 0, // Fixes vertical alignment centering
                    ...styles.shadow,
                    borderTopWidth: 0,
                }
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
                                size={focused ? 24 : 22}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="SoilAnalyzer"
                component={SoilAnalyzerScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Sprout
                                color={focused ? COLORS.white : COLORS.textLight}
                                size={focused ? 24 : 22}
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
                                size={focused ? 24 : 22}
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
                                size={focused ? 24 : 22}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Bidding"
                component={BiddingScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <ShoppingBag
                                color={focused ? COLORS.white : COLORS.textLight}
                                size={focused ? 24 : 22}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <User
                                color={focused ? COLORS.white : COLORS.textLight}
                                size={focused ? 24 : 22}
                            />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#2E7D32',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 46, // Slightly smaller to comfortably fit 7 tabs
        height: 46,
        borderRadius: 23,
        marginTop: Platform.OS === 'ios' ? 15 : 0, // Fixes iOS vertical centering
    },
    activeIconContainer: {
        backgroundColor: COLORS.primary, // Pop up effect with background circle
        transform: [{ translateY: -15 }], // Uses transform instead of margin to prevent layout squashing
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    }
});

export default TabNavigator;
