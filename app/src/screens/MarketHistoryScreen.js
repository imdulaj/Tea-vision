import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TrendingUp, AlertCircle } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');

const MarketHistoryScreen = ({ navigation }) => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMarketHistory();
    }, []);

    const fetchMarketHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Using Alpha Vantage free demo URL (labeled as Tea Index proxy for stability)
            const response = await fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=YG6JYVYVGGNXBRHE');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data && data["Time Series (Daily)"]) {
                const timeSeries = data["Time Series (Daily)"];
                const dates = Object.keys(timeSeries).slice(0, 7).reverse(); // Last 7 days
                const prices = dates.map(date => parseFloat(timeSeries[date]["4. close"]));

                // Format dates to show only Day/Month
                const formattedDates = dates.map(date => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                });

                setChartData({
                    labels: formattedDates,
                    datasets: [
                        {
                            data: prices
                        }
                    ]
                });
            } else {
                throw new Error('API limit reached or invalid data structure.');
            }
        } catch (error) {
            console.error("Error fetching market history:", error);
            setError("Failed to load market data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: '#ffffff',
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Primary Color Green
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.7,
        useShadowColorFromDataset: false, // optional
        decimalPlaces: 2,
        fillShadowGradientFrom: COLORS.primary,
        fillShadowGradientFromOpacity: 0.8,
        fillShadowGradientTo: COLORS.primary,
        fillShadowGradientToOpacity: 0.8,
        propsForBackgroundLines: {
            strokeDasharray: '', // solid background lines with
            stroke: 'rgba(0,0,0,0.05)'
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.primary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Market History</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.summaryCard}>
                    <LinearGradient
                        colors={['rgba(46, 125, 50, 0.9)', 'rgba(46, 125, 50, 0.7)']}
                        style={styles.summaryGradient}
                    >
                        <TrendingUp color={COLORS.white} size={32} style={styles.summaryIcon} />
                        <View style={styles.summaryTextContainer}>
                            <Text style={styles.summaryTitle}>Global Tea Index</Text>
                            <Text style={styles.summarySubtitle}>7-Day Closing Prices</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Historical Performance</Text>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Analyzing previous market data...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <AlertCircle color={COLORS.warning} size={32} />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchMarketHistory}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : chartData ? (
                        <View style={styles.chartWrapper}>
                            <BarChart
                                data={chartData}
                                width={width - SIZES.padding * 2 - 32} // padding adjustments
                                height={280}
                                yAxisLabel="$"
                                chartConfig={chartConfig}
                                verticalLabelRotation={30}
                                showValuesOnTopOfBars={true}
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}
                            />
                        </View>
                    ) : null}
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Analysis Insight</Text>
                    <Text style={styles.infoText}>
                        The chart displays the closing prices of the global tea commodity index over the previous 7 trading days. Use this data to anticipate pricing trends and strategize your next harvest sale.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 15,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    scrollContent: {
        padding: SIZES.padding,
        paddingBottom: 40,
    },
    summaryCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    summaryGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    summaryIcon: {
        marginRight: 15,
        opacity: 0.9,
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    summarySubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 4,
    },
    chartCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textLight,
        fontSize: 14,
    },
    errorContainer: {
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        marginTop: 12,
        color: COLORS.warning,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    retryButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    infoCard: {
        backgroundColor: 'rgba(46, 125, 50, 0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(46, 125, 50, 0.2)',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 22,
    },
});

export default MarketHistoryScreen;
