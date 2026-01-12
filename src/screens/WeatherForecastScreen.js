import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Sun, CloudRain, Wind, Droplet, Calendar, Umbrella, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { useEffect, useState } from 'react';

import { COLORS, SIZES } from '../constants/Theme';
import useLiveLocation from '../hooks/useLiveLocation';
import { getHourlyForecast } from '../services/weatherService';

/* 🕒 Mock Hourly Data */
const hourlyData = [
  { time: 'Now', temp: 24, icon: 'Sun' },
  { time: '1PM', temp: 25, icon: 'Sun' },
  { time: '2PM', temp: 26, icon: 'Cloud' },
  { time: '3PM', temp: 25, icon: 'CloudRain' },
  { time: '4PM', temp: 24, icon: 'CloudRain' },
  { time: '5PM', temp: 23, icon: 'Cloud' },
];

/* 🌾 Agricultural Advisories */
const advisories = [
  {
    id: 1,
    title: 'Pesticide Application',
    status: 'Avoid',
    color: '#E53935',
    detail: 'Rain expected in the afternoon. Wash-off risk high.',
  },
  {
    id: 2,
    title: 'Fertilizer',
    status: 'Recommended',
    color: '#43A047',
    detail: 'Soil moisture is optimal for nutrient absorption.',
  },
  {
    id: 3,
    title: 'Harvesting',
    status: 'Caution',
    color: '#FB8C00',
    detail: 'Plucking standard leaves is fine, but avoid wet leaf handling.',
  },
];


const screenWidth = Dimensions.get('window').width;

/* 🌤 Weather Icon Mapper */
const WeatherIcon = ({ condition }) => {
  if (condition?.includes('Rain')) {
    return <CloudRain size={30} color="#4FC3F7" />;
  }
  if (condition?.includes('Cloud')) {
    return <Cloud size={30} color="#90A4AE" />;
  }
  return <Sun size={30} color="#FFB300" />;
};

const WeatherForecastScreen = ({ route }) => {
  const navigation = useNavigation();
  const { forecast } = route.params;

  // 📍 Live Location for Real Hourly Data
  const { location, address } = useLiveLocation();
  const [hourlyForecast, setHourlyForecast] = useState([]);

  useEffect(() => {
    if (location) {
      fetchHourlyData();
    }
  }, [location]);

  const fetchHourlyData = async () => {
    try {
      const data = await getHourlyForecast(
        location.latitude,
        location.longitude
      );
      setHourlyForecast(data);
    } catch (error) {
      console.error('Failed to fetch hourly forecast', error);
    }
  };

  const chartData = {
    labels: forecast.map(d => d.date.slice(5)),
    datasets: [
      {
        data: forecast.map(d => d.temp),
      },
    ],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E3F2FD' }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ☁️ SKY BACKGROUND GRADIENT */}
      <LinearGradient
        colors={['#E3F2FD', '#FFFFFF', '#FAFAFA']} // Soft Sky Blue -> White
        style={styles.backgroundGradient}
      />
      <View style={styles.backgroundOverlay} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >

        {/* 🌈 PREMIUM HERO HEADER */}
        {/* 🌈 HERO HEADER */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32', '#66BB6A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Watermark Icon */}
          <View style={styles.watermarkContainer}>
            <Sun size={140} color="rgba(255, 255, 255, 0.1)" />
          </View>

          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.subtitle}>Tea Plantation</Text>
            <Text style={styles.title}>Weather Outlook</Text>
            <View style={styles.divider} />
            <Text style={styles.description}>
              Optimized for crop health monitoring
            </Text>
          </View>
        </LinearGradient>

        {/* 🕒 HOURLY TRENDS (Horizontal Scroll) */}
        <View style={styles.hourlySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hourly Forecast</Text>
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>
                {address
                  ? `📍 ${address.city || address.name}, ${address.region}`
                  : '📍 Fetching location...'}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }} // Added paddingBottom to prevent clipping
          >
            {hourlyForecast.length > 0 ? (
              hourlyForecast.map((item, index) => (
                <View key={index} style={styles.hourlyCard}>
                  <Text style={styles.hourlyTime}>{item.time}</Text>
                  <WeatherIcon condition={item.icon} />
                  <Text style={styles.hourlyTemp}>{item.temp}°</Text>
                </View>
              ))
            ) : (
              // Loading / Empty State Placeholder
              <Text style={{ marginLeft: 16, color: COLORS.gray }}>
                Loading hourly data...
              </Text>
            )}
          </ScrollView>
        </View>

        {/* 📊 TEMPERATURE CHART */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Temperature Trend (°C)</Text>

          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={230}
            bezier
            chartConfig={{
              backgroundGradientFrom: '#F1F8E9',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 1,
              color: (opacity = 1) =>
                `rgba(46, 125, 50, ${opacity})`,
              labelColor: () => COLORS.text,
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#2E7D32',
              },
            }}
            style={styles.chart}
          />
        </View>

        {/* 📅 DAILY FORECAST */}
        {/* 📅 DAILY FORECAST */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginBottom: 10, marginTop: 24 }]}>
          Daily Breakdown
        </Text>

        {forecast.map((day, index) => (
          <View key={index} style={styles.forecastCard}>
            <WeatherIcon condition={day.condition} />

            <View style={styles.forecastInfo}>
              <Text style={styles.date}>{day.date}</Text>
              <Text style={styles.condition}>{day.condition}</Text>
            </View>

            <Text style={styles.temp}>{day.temp}°</Text>
          </View>
        ))}

        {/* 🌾 AGRICULTURAL ADVISORIES */}
        {/* 🌾 AGRICULTURAL ADVISORIES */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginBottom: 10, marginTop: 24 }]}>
          Agricultural Advisories
        </Text>
        {advisories.map((advisory) => (
          <View key={advisory.id} style={styles.advisoryCard}>
            <View style={[styles.advisoryIconBar, { backgroundColor: advisory.color }]} />
            <View style={styles.advisoryContent}>
              <View style={styles.advisoryHeader}>
                <Text style={styles.advisoryTitle}>{advisory.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: advisory.color + '20' }]}>
                  <Text style={[styles.statusText, { color: advisory.color }]}>
                    {advisory.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.advisoryDetail}>{advisory.detail}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

export default WeatherForecastScreen;

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  backgroundGradient: {
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
    backgroundColor: 'rgba(241, 248, 233, 0.15)', // Reduced opacity to show more image
  },

  /* 🌈 HERO HEADER */

  /* 🌈 HERO HEADER */
  /* 🌈 HERO HEADER */
  header: {
    padding: 24,
    paddingTop: 24, // Reduced top padding as it's now detached from top edge
    borderRadius: 32, // All 4 corners curved
    marginHorizontal: 16, // Fit to mobile UI width
    marginTop: 10, // Distinct from top
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 280,
    justifyContent: 'space-between',
    elevation: 8, // Make it pop
    shadowColor: '#2E7D32',
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
    marginTop: 10,
  },
  backButton: {
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
    backgroundColor: '#4CAF50', // Bright green for status
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerContent: {
    marginTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800', // Extra bold
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 40,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#A5D6A7', // Light green tint
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  divider: {
    height: 4,
    width: 40,
    backgroundColor: '#FFC107', // Gold accent
    borderRadius: 2,
    marginVertical: 12,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: '80%',
  },


  /* 📊 CHART */
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10, // Added spacing from top elements
    padding: 18,
    borderRadius: 20,
    marginBottom: 26,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  chart: {
    borderRadius: 16,
    marginTop: 10,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text, // Black text for light background
    marginBottom: 8,
  },
  locationBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },

  /* 📅 FORECAST CARDS */
  forecastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  forecastInfo: {
    flex: 1,
    marginLeft: 14,
  },

  date: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  condition: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textLight,
  },

  temp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  /* 🕒 HOURLY SECTION */
  hourlySection: {
    marginBottom: 24, // Reset to standard margin, padding handled in ScrollView
  },
  hourlyCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    width: 70,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  hourlyTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: COLORS.text,
  },

  /* 🌾 ADVISORY CARDS */
  advisoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  advisoryIconBar: {
    width: 6,
    height: '100%',
  },
  advisoryContent: {
    flex: 1,
    padding: 14,
  },
  advisoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  advisoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  advisoryDetail: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});
