import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet, CheckCircle, Clock, ChevronLeft, Info } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/Theme';

const IrrigationScheduleScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { irrigationPlan = [] } = route.params || {};

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
                        <Text style={styles.headerTitle}>Irrigation Schedule</Text>
                        <TouchableOpacity style={styles.infoButton}>
                            <Info size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.heroTextContainer}>
                            <Text style={styles.heroTitle}>Water Management</Text>
                            <Text style={styles.heroSubtitle}>
                                Smart scheduling based on soil moisture and weather forecasts.
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* 💧 IRRIGATION SCHEDULE CARD */}
                <View style={styles.card}>
                    <View style={styles.scheduleItem}>
                        <View style={styles.timeColumn}>
                            <Text style={styles.scheduleTime}>06:00 AM</Text>
                            <Text style={styles.scheduleStatus}>Done</Text>
                        </View>
                        <View style={styles.timelineLine}>
                            <View style={styles.timelineDotActive} />
                            <View style={styles.timelineConnect} />
                        </View>
                        <View style={[styles.scheduleContent, { opacity: 0.6 }]}>
                            <View style={styles.scheduleHeader}>
                                <Droplet size={16} color={COLORS.primary} />
                                <Text style={styles.scheduleTitle}>Morning Mist</Text>
                            </View>
                            <Text style={styles.scheduleDetail}>45 mins • Zone A, B</Text>
                        </View>
                    </View>

                    <View style={styles.scheduleItem}>
                        <View style={styles.timeColumn}>
                            <Text style={styles.scheduleTime}>04:30 PM</Text>
                            <Text style={styles.scheduleStatusUpcoming}>Upcoming</Text>
                        </View>
                        <View style={styles.timelineLine}>
                            <View style={styles.timelineDotPending} />
                        </View>
                        <View style={styles.scheduleContent}>
                            <View style={styles.scheduleHeader}>
                                <Droplet size={16} color="#2196F3" />
                                <Text style={styles.scheduleTitle}>Main Irrigation</Text>
                            </View>
                            <Text style={styles.scheduleDetail}>60 mins • All Zones</Text>
                            <View style={styles.weatherTag}>
                                <CheckCircle size={14} color="#4CAF50" style={{ marginRight: 4 }} />
                                <Text style={styles.weatherTagText}>Soil moisture &lt; 70%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* PLAN LIST */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>3-Day Forecast Plan</Text>
                </View>

                <View style={styles.planContainer}>
                    {irrigationPlan.length > 0 ? (
                        irrigationPlan.map((plan, index) => (
                            <View key={index} style={styles.planItem}>
                                <Clock size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
                                <Text style={styles.planText}>{plan}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Loading schedule...</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default IrrigationScheduleScreen;

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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 0,
        minHeight: 100,
    },
    timeColumn: {
        width: 70,
        alignItems: 'flex-end',
        paddingRight: 12,
        paddingTop: 4,
    },
    scheduleTime: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    scheduleStatus: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 2,
    },
    scheduleStatusUpcoming: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    timelineLine: {
        width: 20,
        alignItems: 'center',
    },
    timelineDotActive: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: '#E8F5E9',
    },
    timelineDotPending: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    timelineConnect: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 4,
    },
    scheduleContent: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 16,
        marginLeft: 8,
        marginBottom: 16,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginLeft: 8,
    },
    scheduleDetail: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    weatherTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    weatherTagText: {
        fontSize: 11,
        color: '#2E7D32',
        fontWeight: '600',
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    planContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 2,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planText: {
        marginLeft: 12,
        fontSize: 15,
        color: '#455A64',
        lineHeight: 22,
        flex: 1,
    },
    emptyText: {
        color: '#B0BEC5',
        fontStyle: 'italic',
    }
});
