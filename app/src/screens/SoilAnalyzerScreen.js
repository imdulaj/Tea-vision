import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config';
import {
    View, Text, StyleSheet, ScrollView, Dimensions,
    ActivityIndicator, RefreshControl, TouchableOpacity, Animated, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/Theme';
import { Droplet, Thermometer, Activity, Leaf, Beaker, Sprout, AlertTriangle, CheckCircle, Bell, RefreshCw, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;


// Mock data generators removed

// ─────────────────────────────────────────────────────────────────────────────
// Ideal ranges for tea cultivation
// ─────────────────────────────────────────────────────────────────────────────
const IDEAL = {
    Nitrogen: { min: 40, max: 80, unit: 'mg/kg', label: 'Nitrogen (N)', icon: Leaf, color: '#2E7D32' },
    Phosphorus: { min: 20, max: 40, unit: 'mg/kg', label: 'Phosphorus (P)', icon: Sprout, color: '#FF9800' },
    Potassium: { min: 40, max: 80, unit: 'mg/kg', label: 'Potassium (K)', icon: Beaker, color: '#1E88E5' },
    pH: { min: 5.0, max: 6.5, unit: '', label: 'Soil pH', icon: Activity, color: '#9C27B0' },
    Moisture: { min: 30, max: 60, unit: '%', label: 'Moisture', icon: Droplet, color: '#03A9F4' },
    Temperature: { min: 20, max: 32, unit: '°C', label: 'Temperature', icon: Thermometer, color: '#F44336' },
    EC: { min: 0.1, max: 2.0, unit: 'dS/m', label: 'EC', icon: Activity, color: '#795548' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fertilizer prediction logic
// ─────────────────────────────────────────────────────────────────────────────
const FERTILIZER_DB = [
    { name: 'Urea', npk: '46-0-0', nutrient: 'N', amount: 50, desc: 'High nitrogen source — boosts leaf growth and shoot development.' },
    { name: 'DAP (Di-Ammonium Phosphate)', npk: '18-46-0', nutrient: 'P', amount: 40, desc: 'Phosphorus-rich — strengthens root systems and improves energy transfer.' },
    { name: 'Muriate of Potash (MOP)', npk: '0-0-60', nutrient: 'K', amount: 45, desc: 'Potassium-rich — enhances disease resistance and water regulation.' },
    { name: 'NPK Complex 10-26-26', npk: '10-26-26', nutrient: 'PK', amount: 60, desc: 'Balanced P & K with some N — ideal when both are low.' },
    { name: 'NPK Complex 20-20-20', npk: '20-20-20', nutrient: 'NPK', amount: 75, desc: 'Fully balanced — general purpose for overall deficiency.' },
    { name: 'Ammonium Sulphate', npk: '21-0-0', nutrient: 'N', amount: 55, desc: 'Nitrogen + sulphur — also helps lower pH in alkaline soils.' },
    { name: 'Single Super Phosphate', npk: '0-16-0', nutrient: 'P', amount: 50, desc: 'Mild phosphorus supply with calcium and sulphur.' },
];

const getParamStatus = (key, value) => {
    const { min, max } = IDEAL[key];
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'optimal';
};

const getParamScore = (key, value) => {
    const { min, max } = IDEAL[key];
    if (value >= min && value <= max) return 100;
    const range = max - min;
    const deviation = value < min ? min - value : value - max;
    return Math.max(0, Math.round(100 - (deviation / range) * 100));
};

// local prediction results omitted, calling backend instead.

// Weather icon helper moved to WeatherForecastScreen.js

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const SoilAnalyzerScreen = () => {
    const navigation = useNavigation();
    const [soilData, setSoilData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [history, setHistory] = useState([]);
    const [locationName, setLocationName] = useState('Detecting location...');
    const refreshCount = React.useRef(0);

    // ── Persistence ──────────────────────────────────────────────────────────
    const saveHistory = async (newHistory) => {
        try {
            await AsyncStorage.setItem('soil_history', JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save soil history', e);
        }
    };

    const loadHistory = async () => {
        try {
            const saved = await AsyncStorage.getItem('soil_history');
            if (saved) setHistory(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load soil history', e);
        }
    };

    const clearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all previous readings?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        await AsyncStorage.removeItem('soil_history');
                        setHistory([]);
                    } 
                }
            ]
        );
    };

    const simulateSensorRemoval = () => {
        const zeroData = {
            Nitrogen: 0,
            Phosphorus: 0,
            Potassium: 0,
            pH: 0,
            Moisture: 0,
            Temperature: 0,
            EC: 0,
        };
        setSoilData(zeroData);
        setPrediction(null);
    };

    const loadLocation = useCallback(async () => {
        const ts = () => new Date().toISOString();
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationName("Location denied");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // 1. Reverse Geocoding
            const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                const name = `${place.city || place.district || 'Tea Estate'}, ${place.region || place.subregion}`;
                setLocationName(name);
                console.log(`[${ts()}] INFO  SoilAnalyzer  Location detected: ${name}`);
            }
        } catch (error) {
            console.log(`[${ts()}] ERROR SoilAnalyzer  Location failed:`, error.message);
        }
    }, []);

    // ── Load sensor readings with 0-reset logic ───────────────────────────
    const loadSensors = useCallback(async () => {
        const ts = () => new Date().toISOString();
        console.log(`[${ts()}] INFO  SoilAnalyzer  Refresh cycle started...`);
        
        // Load Location
        loadLocation();

        // 1. Reset values to 0 immediately...
        const zeroData = { Nitrogen: 0, Phosphorus: 0, Potassium: 0, pH: 0.0, Moisture: 0, Temperature: 0, EC: 0 };
        setSoilData(zeroData);
        setPrediction(null);

        try {
            refreshCount.current += 1;
            const response = await fetch(`${API_BASE_URL}/get-live-sensor`);
            const result = await response.json();
            
            if (!result.success || !result.data) {
                throw new Error("Failed to fetch live sensor data");
            }
            
            const liveData = result.data;
            const data = {
                Nitrogen: liveData.Nitrogen || 0,
                Phosphorus: liveData.Phosphorus || 0,
                Potassium: liveData.Potassium || 0,
                pH: liveData.pH || 0,
                Moisture: liveData.Moisture || 0,
                Temperature: liveData.Temperature || liveData.soil_temp || 0,
                EC: (liveData.EC || 0) / 1000, // Convert from µS/cm to dS/m
            };

            setSoilData(data);
            setHistory(prev => {
                const entry = { id: Date.now(), timestamp: new Date().toLocaleString(), data };
                const updated = [entry, ...prev].slice(0, 10);
                saveHistory(updated);
                return updated;
            });
            console.log(`[${ts()}] DATA  SoilAnalyzer  Parameters:`, {
                Nitrogen: data.Nitrogen.toFixed(1),
                Phosphorus: data.Phosphorus.toFixed(1),
                Potassium: data.Potassium.toFixed(1),
                pH: data.pH.toFixed(2),
                Moisture: data.Moisture.toFixed(1),
                Temperature: data.Temperature.toFixed(1),
                EC: data.EC.toFixed(2)
            });
            console.log(`[${ts()}] INFO  SoilAnalyzer  Refresh complete.`);
        } catch (error) {
            console.log(`[${ts()}] ERROR SoilAnalyzer  Refresh failed:`, error.message);
            Alert.alert("Sensor Error", "Failed to get live sensor data from IoT device.");
        }
    }, [loadLocation]);

    // ── Run fertilizer prediction (Backend AI Model) ──────────────────
    const runPrediction = useCallback(async () => {
        if (!soilData) return;
        setPredicting(true);
        const ts = () => new Date().toISOString();

        console.log(`[${ts()}] INFO  SoilAnalyzer  Running prediction from backend...`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/predict-fertilizer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch prediction");
            }

            const status = data.fertilizer_type === 'None' || data.fertilizer_type === 'No Fertilizer' ? 'optimal' : 'deficient';
            const urgency = status === 'optimal' ? 'NONE' : 'MODERATE';
            const overallScore = 80; // Placeholder as actual score comes from analyze-soil
            const recommendation = data.reason || 'AI recommendation';
            const fertilizers = data.fertilizer_type === 'None' ? [] : [{
                name: data.fertilizer_type,
                npk: 'N/A',
                nutrient: 'Targeted nutrients based on AI',
                amount: data.amount_kg_per_ha,
                desc: data.reason
            }];

            const mappedPrediction = {
                status,
                urgency,
                overallScore,
                recommendation,
                fertilizers,
                deficiencies: [],
                tips: [
                    'Confidence: ' + data.confidence_percent + '%',
                    'Optimal application time: Early morning or late evening.',
                    'Ensure soil is moist before application.',
                    'Split doses into 2-3 applications for better absorption.'
                ]
            };
            
            setPrediction(mappedPrediction);
            console.log(`[${ts()}] INFO  SoilAnalyzer  Backend prediction complete.`);

        } catch (error) {
            console.error("Prediction error:", error);
            Alert.alert("Error", "Something went wrong during analysis.");
        } finally {
            setPredicting(false);
        }
    }, [soilData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadSensors().finally(() => setRefreshing(false));
    }, [loadSensors]);

    useEffect(() => {
        const ts = () => new Date().toISOString();
        console.log(`[${ts()}] INFO  SoilAnalyzer  Initializing screen...`);
        
        loadHistory();
        loadSensors().finally(() => setIsLoading(false));
    }, [loadSensors]);

    // ──────────────────────────────────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────────────────────────────────
    const urgencyColors = {
        CRITICAL: ['#C62828', '#E53935'],
        HIGH: ['#E65100', '#FB8C00'],
        MODERATE: ['#F57F17', '#FDD835'],
        LOW: ['#1565C0', '#42A5F5'],
        NONE: ['#2E7D32', '#66BB6A'],
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            >
                {/* Header */}
                <LinearGradient colors={['#1B5E20', '#2E7D32', '#43A047']} style={styles.headerGradient}>
                    <View style={styles.headerTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Soil Analyzer</Text>
                            <Text style={styles.headerSub}>{locationName}</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn} onPress={simulateSensorRemoval}>
                            <Bell color="#fff" size={24} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerHint}>Pull down to refresh readings</Text>
                </LinearGradient>

                {isLoading && !refreshing ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Reading sensors...</Text>
                    </View>
                ) : !soilData ? (
                    <View style={styles.emptyStateBox}>
                        <View style={styles.emptyIconCircle}>
                            <Activity color={COLORS.primary} size={40} />
                        </View>
                        <Text style={styles.emptyStateTitle}>No Sensor Data</Text>
                        <Text style={styles.emptyStateDesc}>
                            Pull down to connect to sensors and fetch the latest soil parameters.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Weather section removed, moved to Weather tab */}
                        {/* ── Soil Parameters Header Row ─────────────────────────── */}
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Soil Parameters</Text>
                            <TouchableOpacity 
                                style={styles.refreshTriggerCompact} 
                                onPress={onRefresh}
                                disabled={refreshing}
                            >
                                <RefreshCw color={COLORS.primary} size={14} />
                                <Text style={styles.refreshTriggerTextCompact}>Refresh Data</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.paramsGrid}>
                            {Object.entries(IDEAL).map(([key, meta]) => {
                                const value = soilData[key];
                                const status = getParamStatus(key, value);
                                const score = getParamScore(key, value);
                                const Icon = meta.icon;
                                return (
                                    <View key={key} style={styles.paramCard}>
                                        <View style={styles.paramHeader}>
                                            <View style={[styles.paramIconBox, { backgroundColor: meta.color + '15' }]}>
                                                <Icon color={meta.color} size={18} />
                                            </View>
                                            <View style={[styles.statusBadge, {
                                                backgroundColor: status === 'optimal' ? '#E8F5E9'
                                                    : status === 'low' ? '#FFF3E0' : '#FFEBEE'
                                            }]}>
                                                <Text style={[styles.statusBadgeText, {
                                                    color: status === 'optimal' ? '#2E7D32'
                                                        : status === 'low' ? '#E65100' : '#C62828'
                                                }]}>
                                                    {status === 'optimal' ? 'Optimal' : status === 'low' ? 'Low' : 'High'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.paramLabel}>{meta.label}</Text>
                                        <View style={styles.paramValueRow}>
                                            <Text style={[styles.paramValue, { color: meta.color }]}>
                                                {key === 'pH' ? value.toFixed(2) : value.toFixed(1)}
                                            </Text>
                                            <Text style={styles.paramUnit}>{meta.unit}</Text>
                                        </View>
                                        <View style={styles.barBg}>
                                            <View style={[styles.barFill, {
                                                width: `${Math.min(score, 100)}%`,
                                                backgroundColor: score >= 75 ? '#4CAF50'
                                                    : score >= 50 ? '#FF9800' : '#F44336',
                                            }]} />
                                        </View>
                                        <Text style={styles.paramRange}>
                                            Ideal: {meta.min}–{meta.max} {meta.unit}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>



                        {/* ── Predict Button ──────────────────────────────── */}
                        <TouchableOpacity
                            style={[styles.predictBtn, predicting && styles.predictBtnDisabled]}
                            onPress={runPrediction}
                            disabled={predicting}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={predicting ? ['#9E9E9E', '#BDBDBD'] : ['#1B5E20', '#2E7D32']}
                                style={styles.predictBtnGradient}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                {predicting ? (
                                    <>
                                        <ActivityIndicator color="#fff" size="small" />
                                        <Text style={styles.predictBtnText}>  Analyzing...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Leaf color="#fff" size={20} />
                                        <Text style={styles.predictBtnText}>  Predict Fertilizer</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.predictBtn, { marginTop: 12 }]}
                            onPress={() => navigation.navigate('WeatherForecast')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#2E7D32', '#43A047']}
                                style={styles.predictBtnGradient}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                <CloudRain color="#fff" size={20} />
                                <Text style={styles.predictBtnText}>  Check Weather Forecast</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* ── Prediction Results ─────────────────────────── */}
                        {prediction && (
                            <>

                                <Text style={styles.sectionTitle}>Fertilizer Recommendation</Text>

                                {/* Urgency banner */}
                                <LinearGradient
                                    colors={urgencyColors[prediction.urgency] || urgencyColors.NONE}
                                    style={styles.urgencyBanner}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    {prediction.status === 'optimal'
                                        ? <CheckCircle color="#fff" size={22} />
                                        : <AlertTriangle color="#fff" size={22} />}
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <Text style={styles.urgencyTitle}>
                                            {prediction.status === 'optimal' ? 'No Fertilizer Needed' : `Urgency: ${prediction.urgency}`}
                                        </Text>
                                        <Text style={styles.urgencyDesc}>{prediction.recommendation}</Text>
                                    </View>
                                </LinearGradient>

                                {/* Fertilizer cards */}
                                {prediction.fertilizers.map((fert, i) => (
                                    <View key={i} style={styles.fertCard}>
                                        <View style={styles.fertHeader}>
                                            <View style={styles.fertBadge}>
                                                <Text style={styles.fertBadgeText}>{fert.npk}</Text>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={styles.fertName}>{fert.name}</Text>
                                                <Text style={styles.fertDesc}>{fert.desc}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.fertDivider} />
                                        <View style={styles.fertDetailsRow}>
                                            <View style={styles.fertDetail}>
                                                <Text style={styles.fertDetailLabel}>Amount</Text>
                                                <Text style={styles.fertDetailValue}>{fert.amount} kg/ha</Text>
                                            </View>
                                            <View style={styles.fertDetail}>
                                                <Text style={styles.fertDetailLabel}>Targets</Text>
                                                <Text style={styles.fertDetailValue}>{fert.nutrient}</Text>
                                            </View>
                                            <View style={styles.fertDetail}>
                                                <Text style={styles.fertDetailLabel}>Frequency</Text>
                                                <Text style={styles.fertDetailValue}>Every 3 mo</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}

                                {/* Tips */}
                                {prediction.tips.length > 0 && (
                                    <View style={styles.tipsCard}>
                                        <Text style={styles.tipsTitle}>Recommendations</Text>
                                        {prediction.tips.map((tip, i) => (
                                            <View key={i} style={styles.tipRow}>
                                                <View style={styles.tipDot} />
                                                <Text style={styles.tipText}>{tip}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Recent History */}
                        {history.length > 0 && (
                            <View style={styles.historySection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Recent History</Text>
                                    <TouchableOpacity onPress={clearHistory}>
                                        <Text style={styles.clearText}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.historyScroll}
                                >
                                    {history.map((entry) => (
                                        <View key={entry.id} style={styles.historyCard}>
                                            <Text style={styles.historyTime}>{entry.timestamp.split(',')[1].trim()}</Text>
                                            <Text style={styles.historyDate}>{entry.timestamp.split(',')[0]}</Text>
                                            <View style={styles.historyStats}>
                                                <Text style={styles.historyStatText}>N: {entry.data.Nitrogen.toFixed(0)}</Text>
                                                <Text style={styles.historyStatText}>P: {entry.data.Phosphorus.toFixed(0)}</Text>
                                                <Text style={styles.historyStatText}>K: {entry.data.Potassium.toFixed(0)}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F5',
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Header
    headerGradient: {
        marginHorizontal: 12,
        marginTop: 12,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    headerHint: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.55)',
        marginTop: 6,
        fontStyle: 'italic',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        borderWidth: 1.5,
        borderColor: '#2E7D32',
    },

    // Loading
    loadingBox: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textLight,
        fontSize: 14,
    },

    // Weather Forecast styles removed

    // Score
    scoreSection: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 8,
    },
    scoreCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    emptyStateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptyStateDesc: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: -2,
    },
    scoreTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 10,
    },
    scoreDesc: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 40,
    },

    // Section title
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
        marginLeft: 20,
        marginTop: 24,
        marginBottom: 12,
    },

    // Params grid
    paramsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 10,
    },
    paramCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        width: (screenWidth - 44) / 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    paramHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    paramIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    paramLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    paramValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    paramValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    paramUnit: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 4,
    },
    barBg: {
        height: 5,
        backgroundColor: '#ECEFF1',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    barFill: {
        height: 5,
        borderRadius: 3,
    },
    paramRange: {
        fontSize: 10,
        color: '#9E9E9E',
    },

    // Predict button
    predictBtn: {
        marginHorizontal: 16,
        marginTop: 24,
        marginBottom: 8,
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#1B5E20',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    predictBtnDisabled: {
        elevation: 1,
        shadowOpacity: 0.1,
    },
    predictBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    predictBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    // Urgency banner
    urgencyBanner: {
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    urgencyTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    urgencyDesc: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        marginTop: 3,
    },

    // Fertilizer cards
    fertCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    fertHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    fertBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    fertBadgeText: {
        color: '#2E7D32',
        fontWeight: 'bold',
        fontSize: 13,
    },
    fertName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    fertDesc: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
        lineHeight: 17,
    },
    fertDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    fertDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    fertDetail: {
        alignItems: 'center',
    },
    fertDetailLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        marginBottom: 3,
    },
    fertDetailValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },

    // Tips
    tipsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    tipsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginTop: 5,
        marginRight: 10,
    },
    tipText: {
        fontSize: 13,
        color: '#555',
        flex: 1,
        lineHeight: 18,
    },

    // Manual Refresh
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 16,
        marginTop: 12,
        marginBottom: 8,
    },
    refreshTriggerCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    refreshTriggerTextCompact: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 6,
    },

    // History
    historySection: {
        marginTop: 24,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 20,
    },
    clearText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    historyScroll: {
        paddingLeft: 16,
        paddingRight: 20,
        paddingVertical: 10,
    },
    historyCard: {
        backgroundColor: '#fff',
        width: 120,
        padding: 12,
        borderRadius: 16,
        marginRight: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    historyTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    historyDate: {
        fontSize: 10,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    historyStats: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 8,
    },
    historyStatText: {
        fontSize: 11,
        color: '#444',
        marginBottom: 2,
    },
});

export default SoilAnalyzerScreen;
