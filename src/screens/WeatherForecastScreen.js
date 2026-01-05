import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { COLORS, SIZES } from '../constants/Theme';

const screenWidth = Dimensions.get('window').width;

const WeatherForecastScreen = ({ route }) => {
  const navigation = useNavigation();
  const { forecast } = route.params;

  const chartData = {
    labels: forecast.map(d => d.date.slice(5)),
    datasets: [
      {
        data: forecast.map(d => d.temp),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* 🌈 HEADER WITH BACK BUTTON */}
        <LinearGradient colors={[COLORS.primary, '#66BB6A']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={26} />
          </TouchableOpacity>

          <Text style={styles.title}>3-Day Weather Forecast</Text>
          <Text style={styles.subtitle}>Detailed View</Text>
        </LinearGradient>

        {/* 📊 TEMPERATURE CHART */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Temperature Trend (°C)</Text>

          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
              labelColor: () => COLORS.text,
              strokeWidth: 2,
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* 📅 FORECAST DETAILS */}
        {forecast.map((day, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.date}>{day.date}</Text>
            <Text style={styles.condition}>{day.condition}</Text>
            <Text style={styles.temp}>{day.temp}°C</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

export default WeatherForecastScreen;

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 120 },

  header: {
    padding: 22,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },

  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },

  sectionTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },

  date: { fontSize: 16, fontWeight: '600' },
  condition: { marginVertical: 6, color: COLORS.textLight },
  temp: { fontSize: 20, fontWeight: 'bold' },
});
