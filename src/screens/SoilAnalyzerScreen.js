import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Droplet,
  Thermometer,
  MapPin,
  Bell,
} from 'lucide-react-native';

import { COLORS, SIZES } from '../constants/Theme';
import useLiveLocation from '../hooks/useLiveLocation';
import {
  getWeather,
  getThreeDayForecast,
} from '../services/weatherService';

const SoilAnalyzerScreen = () => {
  const { location, address } = useLiveLocation();

  const [hasAlert, setHasAlert] = useState(false);
  const [latestWeather, setLatestWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [advisory, setAdvisory] = useState([]);
  const [irrigationPlan, setIrrigationPlan] = useState([]);

  const soilMoisture = 65;

  useEffect(() => {
    if (!location) return;

    const checkWeather = async () => {
      try {
        const weather = await getWeather(
          location.latitude,
          location.longitude
        );

        if (!weather || !weather.main || !weather.weather) return;

        const temp = weather.main.temp;
        const condition = weather.weather[0].main;

        setLatestWeather({ temp, condition });
        setHasAlert(temp > 30 || condition === 'Rain');

        generateAdvisory(temp, condition);
        generateIrrigationSchedule(temp, condition);
      } catch (err) {
        console.log('Weather error:', err);
      }
    };

    const loadForecast = async () => {
      try {
        const data = await getThreeDayForecast(
          location.latitude,
          location.longitude
        );
        setForecast(data);
      } catch (err) {
        console.log('Forecast error:', err);
      }
    };

    checkWeather();
    loadForecast();

    const interval = setInterval(checkWeather, 120000);
    return () => clearInterval(interval);
  }, [location, forecast]);

  /* 🧠 SMART ADVISORY */
  const generateAdvisory = (temp, condition) => {
    const advice = [];

    if (temp > 30 && soilMoisture < 50)
      advice.push('💧 Irrigation recommended due to high temperature.');

    if (condition === 'Rain')
      advice.push('🌧 Rain detected. Avoid irrigation today.');

    if (forecast.some(day => day.condition === 'Rain'))
      advice.push('☁ Rain expected soon. Delay fertilization.');

    if (temp < 30 && soilMoisture >= 45 && condition !== 'Rain')
      advice.push('✅ Conditions are optimal. No action required.');

    setAdvisory(advice);
  };

  /* 🌱 IRRIGATION SCHEDULE */
  const generateIrrigationSchedule = (temp, condition) => {
    const plan = [];

    if (condition === 'Rain')
      plan.push('🚫 Today: Skip irrigation (rain detected)');
    else if (temp > 30 && soilMoisture < 50)
      plan.push('💧 Today: Moderate irrigation');
    else
      plan.push('💦 Today: Light irrigation');

    const tomorrow = forecast[0];
    plan.push(
      tomorrow?.condition === 'Rain'
        ? '🚫 Tomorrow: Skip irrigation (rain expected)'
        : '💦 Tomorrow: Light irrigation'
    );

    const dayAfter = forecast[1];
    plan.push(
      dayAfter?.condition === 'Rain'
        ? '🚫 Day After: Skip irrigation (rain expected)'
        : '💦 Day After: Light irrigation'
    );

    setIrrigationPlan(plan);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 🌈 HEADER */}
        <LinearGradient colors={[COLORS.primary, '#66BB6A']} style={styles.headerGradient}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitleWhite}>Soil Analysis</Text>
              <Text style={styles.headerSubtitleWhite}>Sensor Node: A-12</Text>
            </View>

            <TouchableOpacity
              onPress={() => latestWeather &&
                Alert.alert(
                  'Latest Weather',
                  `Temperature: ${latestWeather.temp}°C\nCondition: ${latestWeather.condition}`
                )
              }
            >
              <Bell size={26} color={hasAlert ? '#FF5252' : '#fff'} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 📍 LOCATION */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <MapPin color={COLORS.primary} size={20} />
            <Text style={styles.cardTitle}>Location</Text>
          </View>

          <Text style={styles.locationMain}>
            {address
              ? `${address.village || address.town || address.city || 'Unknown Area'}, ${address.region}`
              : 'Fetching location...'}
          </Text>

          {location && (
            <Text style={styles.locationSub}>
              Lat: {location.latitude.toFixed(4)} | Lon: {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* 🌦 FORECAST */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Next 3 Days Weather</Text>
          <View style={styles.forecastContainer}>
            {forecast.map((day, i) => (
              <View key={i} style={styles.forecastCard}>
                <Text style={styles.forecastDate}>{day.date}</Text>
                <Text style={styles.forecastCondition}>{day.condition}</Text>
                <Text style={styles.forecastTemp}>{day.temp}°C</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 🧠 ADVISORY */}
        <View style={[styles.card, styles.advisoryCard]}>
          <Text style={styles.sectionTitle}>🧠 Smart Advisory</Text>
          {advisory.map((a, i) => (
            <Text key={i} style={styles.advisoryText}>• {a}</Text>
          ))}
        </View>

        {/* 🌱 IRRIGATION */}
        <View style={[styles.card, styles.irrigationCard]}>
          <Text style={styles.sectionTitle}>🌱 Irrigation Schedule</Text>
          {irrigationPlan.map((p, i) => (
            <Text key={i} style={styles.advisoryText}>• {p}</Text>
          ))}
        </View>

        {/* 💧 SOIL STATS */}
        <View style={styles.soilStats}>
          <View style={styles.statBox}>
            <Droplet color="#2196F3" size={28} />
            <Text style={styles.statValue}>{soilMoisture}%</Text>
            <Text style={styles.statLabel}>Moisture</Text>
          </View>

          <View style={styles.statBox}>
            <Thermometer color="#F44336" size={28} />
            <Text style={styles.statValue}>25°C</Text>
            <Text style={styles.statLabel}>Temperature</Text>
          </View>
        </View>

        {/* ✅ STATUS */}
        <LinearGradient colors={[COLORS.success, '#81C784']} style={styles.statusCard}>
          <Text style={styles.statusTitle}>Soil Health: Good</Text>
          <Text style={styles.statusDesc}>
            Weather & soil conditions are suitable for cultivation.
          </Text>
        </LinearGradient>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SoilAnalyzerScreen;

/* ===================== 🎨 STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 120, // ⭐ smooth scrolling
  },

  headerGradient: {
    padding: 22,
    borderRadius: 16,
    marginBottom: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerTitleWhite: { fontSize: SIZES.h1, fontWeight: 'bold', color: '#fff' },
  headerSubtitleWhite: { color: 'rgba(255,255,255,0.9)', marginTop: 4 },

  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { marginLeft: 8, fontWeight: '600' },

  locationMain: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  locationSub: { fontSize: 12, color: COLORS.textLight },

  sectionTitle: {
    fontWeight: '600',
    marginBottom: 14,
    marginTop: 4,
  },

  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  forecastCard: {
    width: '32%',
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  forecastDate: { fontSize: 12, color: COLORS.textLight },
  forecastCondition: { fontWeight: '600', marginVertical: 6 },
  forecastTemp: { fontSize: 16, fontWeight: 'bold' },

  advisoryCard: {
    backgroundColor: '#FFFDE7',
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  irrigationCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  advisoryText: {
    marginBottom: 10,
    lineHeight: 20,
  },

  soilStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 10,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  statLabel: { color: COLORS.textLight, marginTop: 4 },

  statusCard: {
    padding: 22,
    borderRadius: 16,
  },
  statusTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  statusDesc: { color: 'rgba(255,255,255,0.9)' },
});
