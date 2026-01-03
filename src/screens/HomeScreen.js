import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/Theme';
import { Leaf, CloudRain, Sun, Wind } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            {/* Background Image - Fixed */}
            <Image
                source={require('../../assets/tea_estate_background.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Overlay Gradient for readability */}
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.05)']}
                style={styles.backgroundImage}
            />

            <SafeAreaView style={styles.contentContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <View>
                            <Text style={styles.greetingText}>Good Morning,</Text>
                            <Text style={styles.roleText}>Estate Manager</Text>
                        </View>
                        <View style={styles.weatherWidget}>
                            <Sun color={COLORS.accent} size={24} />
                            <Text style={styles.weatherText}>24°C</Text>
                        </View>
                    </View>

                    {/* Hero Stats Card - Translucent */}
                    <View style={styles.heroCard}>
                        <LinearGradient
                            colors={['rgba(46, 125, 50, 0.9)', 'rgba(46, 125, 50, 0.7)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroGradient}
                        >
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>Estate Status: Optimal</Text>
                                <Text style={styles.heroSubtitle}>Harvesting in progress - Section B</Text>
                            </View>
                            <Leaf color={COLORS.white} size={50} style={{ opacity: 0.9 }} />
                        </LinearGradient>
                    </View>

                    {/* Quick Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                                <CloudRain color="#2196F3" size={24} />
                            </View>
                            <Text style={styles.statValue}>85%</Text>
                            <Text style={styles.statLabel}>Humidity</Text>
                        </View>
                        {/* Wind Speed was removed by user, keeping only 2 cards or adding a placeholder if layout breaks? The user logic seemed to remove one. I will just fix the error by ensuring valid JSX */}
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                                <Leaf color={COLORS.primary} size={24} />
                            </View>
                            <Text style={styles.statValue}>High</Text>
                            <Text style={styles.statLabel}>Quality</Text>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};