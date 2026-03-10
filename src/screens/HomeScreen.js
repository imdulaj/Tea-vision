import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/Theme';
import {
    Leaf,
    CloudRain,
    Sun,
    Wind,
    Bell,
    ArrowRight,
    TrendingUp,
    Droplet,
    Calendar,
    MoreHorizontal,
    AlertTriangle,
    FileText
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import ScaleButton from '../components/ScaleButton';

const { width } = Dimensions.get('window');

// Simple Progress Bar Component
const ProgressBar = ({ progress, color, height = 6 }) => {
    return (
        <View style={{
            height,
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: height / 2,
            marginTop: 8,
            overflow: 'hidden',
            width: '100%'
        }}>
            <Animated.View style={{
                height: '100%',
                backgroundColor: color,
                width: `${progress * 100}%`,
                borderRadius: height / 2,
            }} />
        </View>
    );
};

const HomeScreen = ({ navigation }) => {
    const [greeting, setGreeting] = useState('Good Morning');
    const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity 0
    const [slideAnim] = useState(new Animated.Value(50)); // Initial position 50px down
    const [pulseAnim] = useState(new Animated.Value(1)); // Initial scale 1

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // Entrance Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.exp),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.exp),
            }),
        ]).start();

        // Pulsing Animation Loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 🖼 BACKGROUND IMAGE */}
            <Image
                source={require('../../assets/tea_estate_background.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* 🌑 OVERLAY for readability */}
            <View style={styles.backgroundOverlay} />

            {/* 🟢 HEADER GRADIENT BACKGROUND */}
            <LinearGradient
                colors={['#1B5E20', '#2E7D32', '#66BB6A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerBackground}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 🟢 TOP BAR */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>{greeting},</Text>
                            <Text style={styles.username}>Estate Manager</Text>
                        </View>
                        <TouchableOpacity style={styles.iconButton}>
                            <Bell color="#fff" size={24} />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>

                    {/* ANIMATED CONTENT WRAPPER */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* 🌿 ESTATE STATUS SUMMARY CARD */}
                        <View style={styles.heroSummaryContainer}>
                            <LinearGradient
                                colors={['rgba(241, 250, 242, 0.95)', 'rgba(241, 250, 242, 0.85)']} // Very Subtle Green Tint
                                style={styles.heroCard}
                            >
                                <View style={styles.heroHeader}>
                                    <View style={styles.statusBadge}>
                                        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }], opacity: fadeAnim }]} />
                                        <Text style={styles.liveText}>OPERATIONAL</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <MoreHorizontal color={COLORS.textLight} size={20} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.heroContent}>
                                    <Text style={styles.heroTitle}>Estate Status: Optimal</Text>
                                    <Text style={styles.heroSubtitle}>Section B harvesting is ahead of schedule.</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.heroStatsRow}>
                                    <View style={styles.heroStatItem}>
                                        <Wind size={20} color={COLORS.primary} />
                                        <Text style={styles.heroStatValue}>12 km/h</Text>
                                        <Text style={styles.heroStatLabel}>Wind</Text>
                                    </View>
                                    <View style={styles.verticalLine} />
                                    <View style={styles.heroStatItem}>
                                        <Sun size={20} color="#FFB300" />
                                        <Text style={styles.heroStatValue}>24°C</Text>
                                        <Text style={styles.heroStatLabel}>Temp</Text>
                                    </View>
                                    <View style={styles.verticalLine} />
                                    <View style={styles.heroStatItem}>
                                        <Droplet size={20} color="#03A9F4" />
                                        <Text style={styles.heroStatValue}>65%</Text>
                                        <Text style={styles.heroStatLabel}>Moisture</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* 📊 DASHBOARD GRID */}
                        <Text style={styles.sectionTitle}>Dashboard</Text>

                        <View style={styles.dashboardGrid}>
                            {/* CARD 1: YIELD */}
                            <ScaleButton style={styles.dashboardCard} onPress={() => { }}>
                                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                                    <Leaf color={COLORS.primary} size={24} />
                                </View>
                                <View>
                                    <Text style={styles.cardValue}>1,250 kg</Text>
                                    <Text style={styles.cardLabel}>Daily Yield</Text>
                                </View>
                                {/* Micro Sparkline Chart */}
                                <View style={{ height: 40, marginTop: 8, overflow: 'hidden' }}>
                                    <Svg height="100%" width="100%" viewBox="0 0 100 40">
                                        <Path
                                            d="M0 35 C 20 35, 20 10, 40 10 C 60 10, 60 25, 80 25 C 90 25, 90 5, 100 5 L 100 40 L 0 40 Z"
                                            fill="rgba(76, 175, 80, 0.2)"
                                        />
                                        <Path
                                            d="M0 35 C 20 35, 20 10, 40 10 C 60 10, 60 25, 80 25 C 90 25, 90 5, 100 5"
                                            stroke={COLORS.primary}
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    </Svg>
                                </View>
                                <View style={styles.trendRow}>
                                    <TrendingUp size={14} color="#4CAF50" />
                                    <Text style={styles.trendText}>+5% vs yesterday</Text>
                                </View>
                            </ScaleButton>


                            {/* CARD 2: QUALITY */}
                            <ScaleButton style={styles.dashboardCard} onPress={() => { }}>
                                <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                                    <CloudRain color="#FF9800" size={24} />
                                </View>
                                <Text style={styles.cardValue}>98%</Text>
                                <Text style={styles.cardLabel}>Leaf Quality</Text>
                                <ProgressBar progress={0.98} color="#FF9800" />
                                <View style={styles.trendRow}>
                                    <Text style={[styles.trendText, { color: '#FF9800' }]}>Optimal</Text>
                                </View>
                            </ScaleButton>
                        </View>

                        <View style={styles.dashboardGrid}>
                            {/* CARD 3: WORKFORCE */}
                            <ScaleButton style={styles.dashboardCard} onPress={() => { }}>
                                <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                                    <Calendar color="#2196F3" size={24} />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={styles.cardValue}>45</Text>
                                    <Text style={{ fontSize: 14, color: COLORS.textLight, marginLeft: 2 }}>/50</Text>
                                </View>
                                <Text style={styles.cardLabel}>Workers Active</Text>
                                <ProgressBar progress={0.9} color="#2196F3" />
                                <View style={styles.trendRow}>
                                    <Text style={[styles.trendText, { color: '#2196F3' }]}>Full Capacity</Text>
                                </View>
                            </ScaleButton>

                            {/* CARD 4: ALERTS */}
                            <ScaleButton style={styles.dashboardCard} onPress={() => { }}>
                                <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                                    <Bell color="#F44336" size={24} />
                                </View>
                                <Text style={styles.cardValue}>2</Text>
                                <Text style={styles.cardLabel}>Pending Alerts</Text>
                                <View style={styles.trendRow}>
                                    <Text style={[styles.trendText, { color: '#F44336' }]}>Action Req.</Text>
                                </View>
                            </ScaleButton>
                        </View>

                        {/* 🚀 QUICK ACTIONS */}
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        {/* QUICK ACTIONS SCROLL */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
                            <ScaleButton style={styles.actionButton} onPress={() => { }}>
                                <LinearGradient colors={['#2E7D32', '#43A047']} style={styles.actionGradient}>
                                    <Text style={styles.actionText}>New Harvest</Text>
                                    <ArrowRight color="#fff" size={16} />
                                </LinearGradient>
                            </ScaleButton>

                            <ScaleButton style={styles.actionButtonOutline} onPress={() => { }}>
                                <AlertTriangle color={COLORS.primary} size={18} style={{ marginRight: 8 }} />
                                <Text style={styles.actionTextOutline}>Log Issue</Text>
                            </ScaleButton>

                            <ScaleButton style={styles.actionButtonOutline} onPress={() => { }}>
                                <FileText color={COLORS.primary} size={18} style={{ marginRight: 8 }} />
                                <Text style={styles.actionTextOutline}>View Reports</Text>
                            </ScaleButton>
                        </ScrollView>


                    </Animated.View>

                    {/* Bottom Spacer since we have a tab bar */}
                    <View style={{ height: 150 }} />

                </ScrollView>
            </SafeAreaView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Should be light grey/white usually
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280, // Covers top area
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    username: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    iconButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        borderWidth: 1,
        borderColor: '#ffffff',
    },

    /* SUMMARY CARD */
    heroSummaryContainer: {
        marginBottom: 32,
        marginTop: 10,
    },
    heroCard: {
        // Glassmorphism with Green Tint
        backgroundColor: 'rgba(200, 230, 201, 0.95)', // Stronger Green Tint for Estate Card
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        elevation: 10,
        shadowColor: '#1B5E20',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2E7D32',
        marginRight: 6,
    },
    liveText: {
        color: '#2E7D32',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    heroContent: {
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B5E20',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    heroStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    verticalLine: {
        width: 1,
        height: 30,
        backgroundColor: '#F0F0F0',
    },
    heroStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 4,
    },
    heroStatLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },

    /* DASHBOARD GRID */
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
        marginLeft: 4, // Align slightly to offset shadow
    },
    dashboardGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dashboardCard: {
        width: '48%',
        // Glassmorphism effect
        backgroundColor: 'rgba(241, 250, 242, 0.85)', // Very Subtle Green Tint
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        // Soft Glow Shadow
        elevation: 4,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 4,
    },
    trendTextAlert: {
        fontSize: 11,
        fontWeight: '700',
        color: '#E53935',
    },

    /* QUICK ACTIONS */
    actionsScroll: {
        overflow: 'visible', // allow shadows
    },
    actionButton: {
        marginRight: 12,
    },
    actionGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    actionButtonOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
        marginRight: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glassy White
        // Shadow for depth
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionTextOutline: {
        color: COLORS.primary, // Green Text
        fontWeight: '600',
        fontSize: 14,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    backgroundOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(241, 248, 233, 0.30)', // Light overlay to blend with theme
    },
});

export default HomeScreen;
