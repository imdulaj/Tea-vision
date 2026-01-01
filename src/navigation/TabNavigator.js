import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Sprout, BarChart2, LayoutDashboard, Bug } from 'lucide-react-native';
import { COLORS } from '../constants/Theme';

import HomeScreen from '../screens/HomeScreen';
import SoilAnalyzerScreen from '../screens/SoilAnalyzerScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import MarketAnalyzerScreen from '../screens/MarketAnalyzerScreen';

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
                    left: 20,
                    right: 20,
                    elevation: 5,
                    backgroundColor: COLORS.white,
                    borderRadius: 30, // Round sides
                    height: 70,
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
                                size={focused ? 28 : 24}
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
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    activeIconContainer: {
        backgroundColor: COLORS.primary, // Pop up effect with background circle
        marginBottom: 25, // Moves it up
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    }
});

export default TabNavigator;
