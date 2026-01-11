import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet, Thermometer, MapPin, Bell, Cloud, CloudRain, Sun, X, Leaf, FlaskConical, MessageCircle } from 'lucide-react-native';


import { useNavigation } from '@react-navigation/native';

import { COLORS, SIZES } from '../constants/Theme';
import useLiveLocation from '../hooks/useLiveLocation';
import {
  getWeather,
  getThreeDayForecast,
} from '../services/weatherService';

const SoilAnalyzerScreen = () => {
  const navigation = useNavigation();
  const { location, address } = useLiveLocation();
  const [modalVisible, setModalVisible] = useState(false);

  const [hasAlert, setHasAlert] = useState(false);
  const [latestWeather, setLatestWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [advisory, setAdvisory] = useState([]);
  const [irrigationPlan, setIrrigationPlan] = useState([]);

  const soilMoisture = 65; // dummy data

  // ✅ Dummy NPK values (UI only)
  const nitrogen = 70;
  const phosphorous = 45;
  const potassium = 60;

  useEffect(() => {
    if (!location) return;

    const loadWeatherData = async () => {
      try {
        const weather = await getWeather(
          location.latitude,
          location.longitude
        );

        if (!weather?.main || !weather?.weather) return;

        const temp = weather.main.temp;
        const humidity = weather.main.humidity;
        const condition = weather.weather[0].main;

        setLatestWeather({ temp, humidity, condition });
        setHasAlert(temp > 30 || condition === 'Rain');

        generateAdvisory(temp, condition);
        generateIrrigationSchedule(temp, condition);
      } catch (error) {
        console.log('Weather error:', error);
      }
    };

    const loadForecast = async () => {
      try {
        const data = await getThreeDayForecast(
          location.latitude,
          location.longitude
        );
        setForecast(data);
      } catch (error) {
        console.log('Forecast error:', error);
      }
    };

    loadWeatherData();
    loadForecast();

    const interval = setInterval(loadWeatherData, 120000);
    return () => clearInterval(interval);
  }, [location]);

  /* 🧠 SMART ADVISORY */
  const generateAdvisory = (temp, condition) => {
    const advice = [];

    if (temp > 30 && soilMoisture < 50)
      advice.push(' Irrigation recommended due to high temperature.');

    if (condition === 'Rain')
      advice.push(' Rain detected. Avoid irrigation today.');

    if (forecast.some(day => day.condition === 'Rain'))
      advice.push(' Rain expected soon. Delay fertilization.');

    if (temp < 30 && soilMoisture >= 45 && condition !== 'Rain')
      advice.push(' Conditions are optimal. No action required.');

    setAdvisory(advice);
  };

  /* 🌱 IRRIGATION SCHEDULE */
  const generateIrrigationSchedule = (temp, condition) => {
    const plan = [];

    if (condition === 'Rain')
      plan.push(' Today: Skip irrigation (rain detected)');
    else if (temp > 30 && soilMoisture < 50)
      plan.push(' Today: Moderate irrigation');
    else
      plan.push(' Today: Light irrigation');

    const tomorrow = forecast[0];
    plan.push(
      tomorrow?.condition === 'Rain'
        ? ' Tomorrow: Skip irrigation (rain expected)'
        : ' Tomorrow: Light irrigation'
    );

    const dayAfter = forecast[1];
    plan.push(
      dayAfter?.condition === 'Rain'
        ? ' Day After: Skip irrigation (rain expected)'
        : ' Day After: Light irrigation'
    );

    setIrrigationPlan(plan);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 🌈 HEADER */}
        {/* 🌈 HERO HEADER */}
        {/* 🌈 HERO HEADER */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32', '#66BB6A']} // Green/Tea Plantation Gradient (Matched)
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Watermark Icon */}
          <View style={styles.watermarkContainer}>
            <Droplet size={140} color="rgba(255, 255, 255, 0.1)" />
          </View>

          <View style={styles.headerTop}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SENSOR LIVE</Text>
            </View>

            <TouchableOpacity
              onPress={() => latestWeather && setModalVisible(true)}
              style={styles.bellButton}
            >
              <Bell size={22} color={hasAlert ? '#FF5252' : '#fff'} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.subtitle}>Smart Monitoring</Text>
            <Text style={styles.title}>Soil Analysis</Text>
            <View style={styles.divider} />
            <Text style={styles.description}>
              Real-time nutrient & moisture tracking
            </Text>
          </View>
        </LinearGradient>

        {/* 📍 LOCATION */}
        {/* 📍 LOCATION CARD */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.locationBadge}>
              <MapPin size={12} color="#5D4037" />
              <Text style={styles.locationText}>
                {address
                  ? `${address.city || address.name}, ${address.region}`
                  : 'Fetching location...'}
              </Text>
            </View>
          </View>

          <View style={styles.rowCenter}>
            <View style={styles.statBoxMedium}>
              <Droplet color="#2196F3" size={28} />
              <Text style={styles.statValueMedium}>{soilMoisture}%</Text>
              <Text style={styles.statLabel}>Moisture</Text>
            </View>
            <View style={styles.statBoxMedium}>
              <Thermometer color="#F44336" size={28} />
              <Text style={styles.statValueMedium}>{Math.round(latestWeather?.temp || 0)}°C</Text>
              <Text style={styles.statLabel}>Temp</Text>
            </View>
            <View style={styles.statBoxMedium}>
              <CloudRain color="#00BCD4" size={28} />
              <Text style={styles.statValueMedium}>{latestWeather?.humidity || '-'}%</Text>
              <Text style={styles.statLabel}>Humidity</Text>
            </View>
          </View>
        </View>

        {/* 📊 NPK GRAPH (ADDED) */}
        {/* 📊 NUTRIENT HEALTH */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🌾 Soil Nutrient Levels</Text>

          {[
            { label: 'Nitrogen (N)', value: nitrogen, max: 100, color: '#4CAF50' },
            { label: 'Phosphorous (P)', value: phosphorous, max: 100, color: '#FFC107' },
            { label: 'Potassium (K)', value: potassium, max: 100, color: '#03A9F4' },
          ].map((item, index) => (
            <View key={index} style={styles.npkRow}>
              <View style={styles.npkInfo}>
                <Text style={styles.npkLabel}>{item.label}</Text>
                <Text style={styles.npkValue}>{item.value} ppm</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(item.value / item.max) * 100}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 🌿 FERTILIZER RECOMMENDATION */}
        {/* 🌿 FERTILIZER RECOMMENDATION */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32', '#43A047']} // Deep Emerald Gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          {/* Watermark */}
          <View style={styles.cardWatermark}>
            <Leaf size={100} color="rgba(255,255,255,0.08)" />
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              <FlaskConical size={32} color="#fff" />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.statusLabel}>PRESCRIPTION</Text>
              <Text style={styles.statusTitle}>Apply Urea</Text>
              <Text style={styles.statusDesc}>
                Boost nitrogen levels to support leaf growth.
              </Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Dosage</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 🌦 FORECAST */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next 3 Days Weather</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('WeatherForecast', { forecast })}
            >
              <Text style={styles.viewMore}>View Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.forecastRow}>
            {forecast.map((day, index) => (
              <View key={index} style={styles.forecastCard}>
                <Text style={styles.forecastDate}>{day.date}</Text>
                <Text style={styles.forecastCond}>{day.condition}</Text>
                <Text style={styles.forecastTemp}>{day.temp}°C</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 🧠 ADVISORY */}
        <View style={[styles.card, styles.advisoryCard]}>
          <Text style={styles.sectionTitle}>🧠 Smart Advisory</Text>
          {advisory.map((item, i) => (
            <Text key={i} style={styles.listText}>• {item}</Text>
          ))}
        </View>

        {/* 🌱 IRRIGATION */}
        <View style={[styles.card, styles.irrigationCard]}>
          <Text style={styles.sectionTitle}>🌱 Irrigation Schedule</Text>
          {irrigationPlan.map((item, i) => (
            <Text key={i} style={styles.listText}>• {item}</Text>
          ))}
        </View>
      </ScrollView>

      {/* 💬 CHATBOT FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SoilChatbot')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.fabGradient}
        >
          <MessageCircle size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* 🔔 CUSTOM NOTIFICATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Live Sensor Update</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {latestWeather ? (
                <>
                  <View style={styles.weatherIconLarge}>
                    {latestWeather.condition.includes('Rain') ? (
                      <CloudRain size={64} color="#4FC3F7" />
                    ) : latestWeather.condition.includes('Cloud') ? (
                      <Cloud size={64} color="#90A4AE" />
                    ) : (
                      <Sun size={64} color="#FFB300" />
                    )}
                  </View>
                  <Text style={styles.modalTemp}>{Math.round(latestWeather.temp)}°C</Text>
                  <Text style={styles.modalCondition}>{latestWeather.condition}</Text>

                  <View style={styles.modalDivider} />

                  <Text style={styles.modalSubtitle}>
                    {hasAlert ? '⚠️ Alert: Conditions require attention.' : '✅ Conditions are optimal.'}
                  </Text>
                </>
              ) : (
                <Text>Loading sensor data...</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SoilAnalyzerScreen;

/* ===================== 🎨 STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 120,
  },

  /* 🌈 HERO HEADER */
  header: {
    padding: 24,
    paddingTop: 24,
    borderRadius: 32,
    marginTop: 10,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 220,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#2E7D32', // Matched shadow color to green
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  watermarkContainer: {
    position: 'absolute',
    top: -20,
    right: -30,
    opacity: 0.6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bellButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerContent: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 40,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#D7CCC8', // Light earth tint
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  divider: {
    height: 4,
    width: 40,
    backgroundColor: '#FFC107',
    borderRadius: 2,
    marginVertical: 12,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: '80%',
  },



  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEBE9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#5D4037',
    fontWeight: '600',
    marginLeft: 4,
  },

  /* STAT BOXES */
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBoxMedium: {
    width: '31%',
    backgroundColor: '#FAFAFA',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  statValueMedium: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: '600',
  },

  /* NPK BARS */
  npkRow: {
    marginBottom: 16,
  },
  npkInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  npkLabel: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 14,
  },
  npkValue: {
    fontWeight: '700',
    color: COLORS.textLight,
    fontSize: 14,
  },
  barBg: {
    height: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },

  /* RECOMMENDATION CARD */
  statusCard: {
    padding: 24,
    borderRadius: 24,
    marginHorizontal: 0, // Align with other cards
    marginBottom: 24,
    elevation: 6,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusLabel: {
    color: '#81C784',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statusDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
  },
  actionButtonText: {
    color: '#1B5E20',
    fontWeight: '700',
    fontSize: 12,
  },

  /* FORECAST */
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastCard: {
    width: '31%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  forecastDate: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  forecastCond: { fontWeight: '600', fontSize: 13, color: COLORS.text, marginBottom: 4 },
  forecastTemp: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },

  /* ADVISORY LISTS */
  listText: {
    marginBottom: 12,
    lineHeight: 22,
    fontSize: 14,
    color: COLORS.text,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
  },
  advisoryCard: {
    borderLeftWidth: 0,
    backgroundColor: '#fff'
  },
  irrigationCard: {
    borderLeftWidth: 0,
    backgroundColor: '#fff'
  },
  viewMore: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  viewMore: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  /* 🔔 MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIconLarge: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 50,
  },
  modalTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCondition: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: '500',
    marginTop: -4,
  },
  modalDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* 💬 FAB STYLES */
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    zIndex: 100,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderRadius: 30,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
