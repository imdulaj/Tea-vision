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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: SIZES.padding,
        paddingBottom: 100, // Space for bottom tab
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    roleText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    weatherWidget: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
    },
    weatherText: {
        marginLeft: 8,
        fontWeight: '600',
        color: COLORS.text,
    },
    heroCard: {
        marginBottom: 20,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    heroGradient: {
        padding: 20,
        height: 140,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroContent: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 6,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 25,
    },
    statCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        width: '31%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white, // Changed to white for visibility on bg
        marginBottom: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4
    },
    alertCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
        elevation: 2,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    alertTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    alertTime: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    alertDesc: {
        fontSize: 13,
        color: COLORS.textLight,
        lineHeight: 18,
    },
});

export default HomeScreen;
