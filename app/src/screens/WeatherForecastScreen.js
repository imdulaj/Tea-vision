import React, { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import {
    View, Text, StyleSheet, ScrollView, Dimensions,
    ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/Theme';
import { Droplet, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, MapPin, ArrowLeft } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

const getWeatherIcon = (code) => {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return <Sun size={32} color="#FBC02D" />; // Clear sky
    if (code >= 1 && code <= 3) return <Cloud size={32} color="#90A4AE" />; // Mainly clear, partly cloudy, and overcast
    if (code >= 45 && code <= 48) return <Wind size={32} color="#78909C" />; // Fog
    if (code >= 51 && code <= 67) return <CloudRain size={32} color="#42A5F5" />; // Drizzle, Rain
    if (code >= 71 && code <= 77) return <CloudSnow size={32} color="#E1F5FE" />; // Snow
    if (code >= 80 && code <= 82) return <CloudRain size={32} color="#1E88E5" />; // Rain showers
    if (code >= 95 && code <= 99) return <CloudLightning size={32} color="#FFD600" />; // Thunderstorm
    return <Sun size={32} color="#FBC02D" />;
};

const WeatherForecastScreen = () => {
    const navigation = useNavigation();
    const [locationName, setLocationName] = useState('Detecting location...');
    const [forecast, setForecast] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadLocationAndWeather = useCallback(async () => {
        setIsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationName("Location denied");
                setIsLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                const name = `${place.city || place.district || 'Tea Estate'}, ${place.region || place.subregion}`;
                setLocationName(name);
            }

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=3`;
            const response = await fetch(weatherUrl);
            const data = await response.json();
            
            const forecastDays = data.daily.time.map((time, index) => ({
                date: time,
                maxTemp: data.daily.temperature_2m_max[index],
                minTemp: data.daily.temperature_2m_min[index],
                rain: data.daily.precipitation_sum[index],
                code: data.daily.weathercode[index]
            }));

            setForecast(forecastDays);
        } catch (error) {
            console.error("Weather/Location failed:", error.message);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadLocationAndWeather();
    }, [loadLocationAndWeather]);

    useEffect(() => {
        loadLocationAndWeather();
    }, [loadLocationAndWeather]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header matching Soil Analyzer */}
            <LinearGradient colors={['#1B5E20', '#2E7D32', '#43A047']} style={styles.headerGradient}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.headerTitle}>Weather Forecast</Text>
                        <Text style={styles.headerSub}>{locationName}</Text>
                    </View>
                </View>
                <Text style={styles.headerHint}>3-Day Tea Estate Outlook</Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Fetching forecast...</Text>
                    </View>
                ) : forecast ? (
                    <View style={styles.forecastContainer}>
                        {/* Current/Today Highlight */}
                        <View style={[styles.dayCard, styles.currentDayCard]}>
                            <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={styles.cardGradient}>
                                <View style={styles.dayHeader}>
                                    <View>
                                        <Text style={styles.dayLabel}>Today</Text>
                                        <Text style={styles.fullDate}>{new Date(forecast[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>Current</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.dayBody}>
                                    <View style={styles.mainWeatherInfo}>
                                        <View style={styles.largeIconBox}>
                                            {getWeatherIcon(forecast[0].code)}
                                        </View>
                                        <View style={styles.largeTempBox}>
                                            <Text style={styles.largeTemp}>{Math.round(forecast[0].maxTemp)}°</Text>
                                            <Text style={styles.largeTempUnit}>C</Text>
                                        </View>
                                    </View>

                                    <View style={styles.weatherDetailsRow}>
                                        <View style={styles.detailItem}>
                                            <Droplet size={18} color={COLORS.primary} />
                                            <Text style={styles.detailValue}>{forecast[0].rain} mm</Text>
                                            <Text style={styles.detailLabel}>Rain</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.detailItem}>
                                            <Sun size={18} color="#FBC02D" />
                                            <Text style={styles.detailValue}>{Math.round(forecast[0].minTemp)}°C</Text>
                                            <Text style={styles.detailLabel}>Low</Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>

                        <Text style={styles.sectionSubtitle}>Upcoming Days</Text>

                        {forecast.slice(1).map((day, i) => (
                            <View key={i} style={styles.dayCard}>
                                <View style={styles.dayBodyCompact}>
                                    <View style={styles.dateBox}>
                                        <Text style={styles.dayNameShort}>
                                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </Text>
                                        <Text style={styles.dateNum}>
                                            {new Date(day.date).getDate()}
                                        </Text>
                                    </View>

                                    <View style={styles.iconBoxSmall}>
                                        {getWeatherIcon(day.code)}
                                    </View>

                                    <View style={styles.tempBoxSmall}>
                                        <Text style={styles.tempHigh}>{Math.round(day.maxTemp)}°C</Text>
                                        <Text style={styles.tempLow}>{Math.round(day.minTemp)}°C</Text>
                                    </View>

                                    <View style={styles.rainBoxSmall}>
                                        <View style={styles.rainLabelRow}>
                                            <Droplet size={12} color="#039BE5" />
                                            <Text style={styles.rainValueSmall}>{day.rain}mm</Text>
                                        </View>
                                        <View style={styles.rainBarBg}>
                                            <View style={[styles.rainBarFill, { width: `${Math.min(day.rain * 10, 100)}%` }]} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Weather data unavailable</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F9',
    },
    // Header
    headerGradient: {
        marginHorizontal: 12,
        marginTop: 12,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    headerHint: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 12,
        fontStyle: 'italic',
        marginLeft: 52, // Align with text
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: COLORS.textLight,
    },
    forecastContainer: {
        gap: 12,
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 8,
        marginBottom: 4,
    },
    dayCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    currentDayCard: {
        marginBottom: 8,
    },
    cardGradient: {
        padding: 20,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    dayLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    fullDate: {
        fontSize: 13,
        color: COLORS.textLight,
    },
    statusBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    mainWeatherInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        marginBottom: 20,
    },
    largeIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    largeTempBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    largeTemp: {
        fontSize: 56,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    largeTempUnit: {
        fontSize: 20,
        color: COLORS.textLight,
        marginTop: 12,
        fontWeight: 'bold',
    },
    weatherDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 15,
        paddingVertical: 15,
    },
    detailItem: {
        alignItems: 'center',
        flex: 1,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 4,
    },
    detailLabel: {
        fontSize: 11,
        color: COLORS.textLight,
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },

    // Compact styles for upcoming days
    dayBodyCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    dateBox: {
        width: 50,
        alignItems: 'center',
    },
    dayNameShort: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    dateNum: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    iconBoxSmall: {
        width: 50,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    tempBoxSmall: {
        flex: 1,
        justifyContent: 'center',
    },
    tempHigh: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    tempLow: {
        fontSize: 13,
        color: COLORS.textLight,
    },
    rainBoxSmall: {
        width: 80,
        alignItems: 'flex-end',
    },
    rainLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    rainValueSmall: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#039BE5',
        marginLeft: 4,
    },
    rainBarBg: {
        height: 6,
        width: '100%',
        backgroundColor: '#E1F5FE',
        borderRadius: 3,
        overflow: 'hidden',
    },
    rainBarFill: {
        height: '100%',
        backgroundColor: '#039BE5',
        borderRadius: 3,
    },

    errorContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: 20,
    },
    retryBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default WeatherForecastScreen;
