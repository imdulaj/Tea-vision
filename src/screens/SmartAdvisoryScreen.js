import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, Lightbulb, ChevronLeft, Info } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/Theme';

const SmartAdvisoryScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Receive advisory data from params, or use default
    const { advisory = [] } = route.params || {};

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#FFF8E1', '#F1F8E9', '#E8F5E9']}
                style={styles.backgroundGradient}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 🌈 HERO HEADER */}
                <LinearGradient
                    colors={['#1B5E20', '#2E7D32', '#43A047']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.headerBackground}
                >
                    <View style={styles.headerNav}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Smart Advisory</Text>
                        <TouchableOpacity style={styles.infoButton}>
                            <Info size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.heroTextContainer}>
                            <Text style={styles.heroTitle}>Growth Optimization</Text>
                            <Text style={styles.heroSubtitle}>
                                AI-driven insights for maximizing your tea plantation yield.
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* 🌱 ADVISORY CARD */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                            <Sprout color={COLORS.primary} size={28} />
                        </View>
                        <Text style={styles.cardTitle}>Optimized for Growth</Text>
                    </View>

                    <View style={styles.divider} />

                    {advisory.length > 0 ? (
                        advisory.map((adv, index) => (
                            <View key={index} style={styles.advisoryItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.cardText}>{adv}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.cardText}>
                            Soil info is stable. No specific actions required at this moment.
                        </Text>
                    )}

                    <View style={styles.tipBox}>
                        <Lightbulb size={20} color="#F57F17" style={{ marginRight: 10 }} />
                        <Text style={styles.recommendationText}>
                            Tip: Regular monitoring in the morning gives the most accurate moisture readings.
                        </Text>
                    </View>
                </View>

                {/* EXTRA INFO */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>About This Advisory</Text>
                    <Text style={styles.infoText}>
                        These recommendations are generated based on real-time soil moisture, temperature sensors, and local weather forecasts. AI analysis helps optimize crop yield while conserving resources.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default SmartAdvisoryScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    /* HEADER */
    headerBackground: {
        padding: 24,
        paddingTop: 24,
        borderRadius: 24,
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    infoButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroTextContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 18,
    },

    /* SCROLL CONTENT */
    scrollContent: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    iconContainer: {
        padding: 12,
        borderRadius: 16,
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginBottom: 16,
    },
    advisoryItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginTop: 8,
        marginRight: 12,
    },
    cardText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#455A64',
        flex: 1,
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    recommendationText: {
        color: '#E65100',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        lineHeight: 20,
    },
    infoCard: {
        padding: 24,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#546E7A',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#78909C',
        lineHeight: 22,
    },
    scrollView: {
        flex: 1,
    }
});
