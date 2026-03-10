import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, FlaskConical, ChevronLeft, Droplet, Info, Award, ArrowUpRight, CheckCircle, Thermometer, Wind, TestTube } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/Theme';

const SoilHealthScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [applied, setApplied] = useState(false);

    // Params from Dashboard (or defaults)
    const { soilMoisture = 65, temp = 24, humidity = 72 } = route.params || {};
    const phLevel = 6.5; // Dummy or calculated pH value

    // ✅ Dummy NPK values (UI only)
    const nutrients = [
        {
            id: 'n',
            label: 'Nitrogen (N)',
            value: 70,
            max: 100,
            color: '#4CAF50',
            icon: <Leaf size={20} color="#4CAF50" />,
            desc: 'Essential for leafy growth'
        },
        {
            id: 'p',
            label: 'Phosphorous (P)',
            value: 45,
            max: 100,
            color: '#FFC107',
            icon: <FlaskConical size={20} color="#FFC107" />,
            desc: 'Crucial for root development'
        },
        {
            id: 'k',
            label: 'Potassium (K)',
            value: 60,
            max: 100,
            color: '#03A9F4',
            icon: <Droplet size={20} color="#03A9F4" />,
            desc: 'Regulates water uptake'
        },
    ];

    const getStatusParams = (value) => {
        if (value > 65) return { text: 'Optimal', color: '#4CAF50', bg: '#E8F5E9' };
        if (value > 35) return { text: 'Moderate', color: '#FFC107', bg: '#FFF8E1' };
        return { text: 'Low', color: '#F44336', bg: '#FFEBEE' };
    };

    const handleApply = () => {
        Alert.alert("Recorded", "Fertilizer application has been logged.");
        setApplied(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* 🌈 BACKGROUND */}
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
                        <Text style={styles.headerTitle}>Soil Health</Text>
                        <TouchableOpacity style={styles.infoButton}>
                            <Info size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.heroTextContainer}>
                            <Text style={styles.heroTitle}>Soil Condition: Good</Text>
                            <Text style={styles.heroSubtitle}>
                                Nutrient levels are balanced but require minor nitrogen boost.
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* 🌡 SENSOR READINGS */}
                {/* 🌡 SENSOR READINGS */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sensorScroll}
                >
                    {[
                        {
                            label: 'Moisture',
                            value: `${soilMoisture}%`,
                            icon: <Droplet size={20} color="#0288D1" />,
                            accent: '#0288D1'
                        },
                        {
                            label: 'Temp',
                            value: `${Math.round(temp)}°C`,
                            icon: <Thermometer size={20} color="#D32F2F" />,
                            accent: '#D32F2F'
                        },
                        {
                            label: 'Humidity',
                            value: `${humidity}%`,
                            icon: <Wind size={20} color="#0097A7" />,
                            accent: '#0097A7'
                        },
                        {
                            label: 'pH Level',
                            value: `${phLevel}`,
                            icon: <TestTube size={20} color="#7B1FA2" />,
                            accent: '#7B1FA2'
                        }
                    ].map((sensor, index) => (
                        <View
                            key={index}
                            style={styles.sensorCard}
                        >
                            <View style={[styles.sensorIconBg, { backgroundColor: '#F5F5F5' }]}>
                                {sensor.icon}
                            </View>
                            <Text style={styles.sensorValue}>{sensor.value}</Text>
                            <Text style={styles.sensorLabel}>{sensor.label}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* 📊 NUTRIENT DETAILS CARD */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Nutrient Analysis (ppm)</Text>
                </View>

                {nutrients.map((item, index) => {
                    const status = getStatusParams(item.value);
                    return (
                        <View key={index} style={styles.nutrientCard}>
                            <View style={styles.nutrientHeader}>
                                <View style={styles.nutrientIconBg}>
                                    {item.icon}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nutrientLabel}>{item.label}</Text>
                                    <Text style={styles.nutrientDesc}>{item.desc}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                    <Text style={[styles.statusText, { color: status.color }]}>
                                        {status.text}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.barContainer}>
                                <View style={styles.barBackground}>
                                    <LinearGradient
                                        colors={[item.color, item.color]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.barFill, { width: `${(item.value / item.max) * 100}%` }]}
                                    />
                                </View>
                                <Text style={styles.barValue}>{item.value}/{item.max}</Text>
                            </View>
                        </View>
                    );
                })}

                {/* 🌿 FERTILIZER PRESCRIPTION */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommended Action</Text>
                </View>

                <LinearGradient
                    colors={['#fff', '#F1F8E9']}
                    style={styles.prescriptionCard}
                >
                    <View style={styles.prescriptionHeader}>
                        <View style={[styles.pIconBg, { backgroundColor: '#E8F5E9' }]}>
                            <FlaskConical size={28} color="#2E7D32" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pLabel}>PRESCRIPTION</Text>
                            <Text style={styles.pTitle}>Apply Urea (Nitrogen)</Text>
                        </View>
                        <Award size={24} color="#FFC107" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Dosage</Text>
                            <Text style={styles.detailValue}>50kg / ha</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Frequency</Text>
                            <Text style={styles.detailValue}>Once</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Method</Text>
                            <Text style={styles.detailValue}>Broadcast</Text>
                        </View>
                    </View>

                    <View style={styles.noteBox}>
                        <Info size={16} color="#546E7A" style={{ marginTop: 2 }} />
                        <Text style={styles.noteText}>
                            Apply during early morning or late afternoon when soil is moist. Avoid applying if rain is expected within 24 hours.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.applyButton, applied && styles.appliedButton]}
                        onPress={handleApply}
                        disabled={applied}
                    >
                        {applied ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.applyButtonText}>Application Logged</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.applyButtonText}>Mark as Applied</Text>
                                <ArrowUpRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>

                </LinearGradient>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default SoilHealthScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
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
    sectionHeader: {
        marginBottom: 12,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#37474F',
    },

    /* SENSOR SCROLL */
    sensorScroll: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        marginBottom: 10,
    },
    sensorCard: {
        width: 100, // Reduced width
        marginRight: 12,
        borderRadius: 16, // Reduced border radius
        padding: 12, // Reduced padding
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff', // White background
        elevation: 2, // Reduced elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sensorIconBg: {
        width: 36, // Smaller icon scale
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    sensorValue: {
        fontSize: 16, // Smaller font
        fontWeight: '700',
        color: '#333',
        marginTop: 2,
        marginBottom: 0,
    },
    sensorLabel: {
        fontSize: 10, // Smaller font
        fontWeight: '600',
        color: '#78909C',
        textTransform: 'uppercase',
    },

    /* NUTRIENT CARDS */
    nutrientCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    nutrientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    nutrientIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    nutrientLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    nutrientDesc: {
        fontSize: 12,
        color: '#78909C',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    barBackground: {
        flex: 1,
        height: 10,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        overflow: 'hidden',
        marginRight: 12,
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },
    barValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        width: 40,
        textAlign: 'right',
    },

    /* PRESCRIPTION CARD */
    prescriptionCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.1)',
        elevation: 4,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    prescriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    pIconBg: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    pLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2E7D32',
        letterSpacing: 1,
        marginBottom: 2,
    },
    pTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1B5E20',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 16,
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    detailItem: {
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 12,
        color: '#78909C',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    noteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#ECEFF1',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    noteText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 13,
        color: '#546E7A',
        lineHeight: 18,
    },
    applyButton: {
        flexDirection: 'row',
        backgroundColor: '#2E7D32',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    appliedButton: {
        backgroundColor: '#81C784',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
