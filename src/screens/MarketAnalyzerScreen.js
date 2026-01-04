import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../constants/Theme';
import { TrendingUp, DollarSign, Activity } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

const MarketAnalyzerScreen = () => {
    const data = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [
            {
                data: [20, 25, 22, 30, 28, 35],
                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                strokeWidth: 2
            },
            {
                data: [18, 20, 19, 22, 21, 25],
                color: (opacity = 1) => `rgba(121, 85, 72, ${opacity})`, // Competitor/Avg
                strokeWidth: 2
            }
        ],
        legend: ["Your Estate", "Market Avg"]
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Market Analytics</Text>

                {/* Main Chart */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Price Trends (USD/kg)</Text>
                        <TrendingUp color={COLORS.success} size={20} />
                    </View>

                    {/* <LineChart
                        data={data}
                        width={screenWidth - 64}
                        height={220}
                        chartConfig={{
                            backgroundColor: COLORS.white,
                            backgroundGradientFrom: COLORS.white,
                            backgroundGradientTo: COLORS.white,
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: 6,
                                strokeWidth: 2,
                                stroke: COLORS.white
                            }
                        }}
                        bezier
                        style={styles.chart}
                    /> */}
                </View>

                {/* Prediction Cards */}
                <View style={styles.row}>
                    <View style={[styles.card, styles.statCard]}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF8E1' }]}>
                            <DollarSign color={COLORS.accent} size={24} />
                        </View>
                        <Text style={styles.statLabel}>Prop. Profit</Text>
                        <Text style={styles.statValue}>+12.4%</Text>
                    </View>
                    <View style={[styles.card, styles.statCard]}>
                        <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                            <Activity color="#2196F3" size={24} />
                        </View>
                        <Text style={styles.statLabel}>Demand</Text>
                        <Text style={styles.statValue}>High</Text>
                    </View>
                    <View style={[styles.card, styles.statCard]}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                            <TrendingUp color="#F44336" size={24} />
                        </View>
                        <Text style={styles.statLabel}>Supply</Text>
                        <Text style={styles.statValue}>Low</Text>
                    </View>
                </View>

                {/* Insight Box */}
                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>Market Insight</Text>
                    <Text style={styles.insightDesc}>
                        Global demand for organic black tea is surging. Recommended to hold stock for 2 more days for peak pricing.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};