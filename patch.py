import sys

with open('app/src/screens/BiddingScreen.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import React, { useState, useEffect } from 'react';\nimport { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal, TextInput, Alert, Animated } from 'react-native';"
)

# 2. Icons
content = content.replace(
    "import { Clock, TrendingUp, ShoppingBag, Leaf, Gavel, Plus, X, ImagePlus, Bell } from 'lucide-react-native';",
    "import { Clock, TrendingUp, TrendingDown, ShoppingBag, Leaf, Gavel, Plus, X, ImagePlus, Bell } from 'lucide-react-native';"
)

# 3. State and Interval
old_state = '''    // Create Bid State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingBid, setCreatingBid] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        description: '',
        starting_price: '',
        image: null
    });
    useEffect(() => {
        fetchBids();
    }, []);'''

new_state = '''    // Create Bid State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingBid, setCreatingBid] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        description: '',
        starting_price: '',
        image: null
    });

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [latestAlert, setLatestAlert] = useState(null);
    const slideAnim = useRef(new Animated.Value(-100)).current;

    // Simulated Tea Price Notification Interval
    useEffect(() => {
        const teaTypes = ['FBOP', 'BOP', 'Dust', 'Pekoe', 'Silver Tips'];
        const trends = ['up', 'down'];
        
        const interval = setInterval(() => {
            if (Math.random() > 0.4) {
                const randomTea = teaTypes[Math.floor(Math.random() * teaTypes.length)];
                const randomTrend = trends[Math.floor(Math.random() * trends.length)];
                const randomPercent = (Math.random() * 3 + 0.5).toFixed(1);
                
                const newAlert = {
                    id: Date.now().toString(),
                    teaType: randomTea,
                    trend: randomTrend,
                    percentage: randomPercent,
                    message: randomTrend === 'up' 
                        ? `Global Demand: ${randomTea} prices increased by ${randomPercent}%`
                        : `Market Surplus: ${randomTea} prices dropped by ${randomPercent}%`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                setNotifications(prev => [newAlert, ...prev]);
                setUnreadCount(prev => prev + 1);
                setLatestAlert(newAlert);

                Animated.sequence([
                    Animated.timing(slideAnim, {
                        toValue: 50,
                        duration: 500,
                        useNativeDriver: true
                    }),
                    Animated.delay(3000),
                    Animated.timing(slideAnim, {
                        toValue: -100,
                        duration: 500,
                        useNativeDriver: true
                    })
                ]).start();
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [slideAnim]);

    const openNotifications = () => {
        setUnreadCount(0);
        setShowNotificationsModal(true);
    };

    useEffect(() => {
        fetchBids();
    }, []);'''

content = content.replace(old_state, new_state)

# 4. Banner
old_banner = '''    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Premium Floating Header ─────────────────────── */}'''

new_banner = '''    return (
        <SafeAreaView style={styles.container}>
            {/* Animated Alert Banner */}
            <Animated.View style={[styles.alertBanner, { transform: [{ translateY: slideAnim }] }]}>
                {latestAlert && (
                    <LinearGradient
                        colors={latestAlert.trend === 'up' ? ['#2E7D32', '#43A047'] : ['#C62828', '#E53935']}
                        style={styles.alertBannerGradient}
                    >
                        {latestAlert.trend === 'up' ? <TrendingUp color="#fff" size={20} /> : <TrendingDown color="#fff" size={20} />}
                        <View style={styles.alertBannerTextContainer}>
                            <Text style={styles.alertBannerTitle}>Global Price Alert: {latestAlert.teaType}</Text>
                            <Text style={styles.alertBannerMsg}>{latestAlert.message}</Text>
                        </View>
                    </LinearGradient>
                )}
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Premium Floating Header ─────────────────────── */}'''

content = content.replace(old_banner, new_banner)

# 5. Bell
old_bell = '''                        </View>
                        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
                            <Bell color="#fff" size={24} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                    </View>'''

new_bell = '''                        </View>
                        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7} onPress={openNotifications}>
                            <Bell color="#fff" size={24} />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeTextCount}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>'''

content = content.replace(old_bell, new_bell)

# 6. Modal
old_modal = '''                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );'''

new_modal = '''                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}

            {/* Notifications Modal */}
            {showNotificationsModal && (
                <Modal animationType="slide" transparent={true} visible={showNotificationsModal}>
                    <View style={styles.modalBlurOverlay}>
                        <View style={styles.modernModalContentLarge}>
                            <View style={styles.modalHeaderRow}>
                                <View>
                                    <Text style={styles.modernModalTitle}>Market Alerts</Text>
                                    <Text style={styles.modalSub}>Global tea price fluctuations</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                                    <X color={COLORS.textLight} size={24} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <View key={notif.id} style={styles.notificationItem}>
                                            <View style={[styles.trendIconBox, notif.trend === 'up' ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#FFEBEE' }]}>
                                                {notif.trend === 'up' 
                                                    ? <TrendingUp color="#2E7D32" size={20} />
                                                    : <TrendingDown color="#C62828" size={20} />
                                                }
                                            </View>
                                            <View style={styles.notificationInfo}>
                                                <Text style={styles.notificationTitle}>{notif.teaType} Market</Text>
                                                <Text style={styles.notificationMsg}>{notif.message}</Text>
                                                <Text style={styles.notificationTime}>{notif.time}</Text>
                                            </View>
                                            <View style={[styles.percentBadge, notif.trend === 'up' ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#C62828' }]}>
                                                <Text style={styles.percentText}>{notif.trend === 'up' ? '+' : '-'}{notif.percentage}%</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Bell size={48} color={COLORS.textLight} opacity={0.5} />
                                        <Text style={styles.emptyStateText}>No market alerts yet.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}

        </SafeAreaView>
    );'''

content = content.replace(old_modal, new_modal)

# 7. Badge style
old_badge_style = '''        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        borderWidth: 1.5,
        borderColor: '#2E7D32',
    },

    // Header Actions'''

new_badge_style = '''        top: 8,
        right: 8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FF5252',
        borderWidth: 1.5,
        borderColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    badgeTextCount: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Alert Banner
    alertBanner: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        zIndex: 100,
        elevation: 10,
    },
    alertBannerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    alertBannerTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    alertBannerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    alertBannerMsg: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        marginTop: 2,
    },

    // Header Actions'''

content = content.replace(old_badge_style, new_badge_style)

# 8. List style
old_list_style = '''    emptyStateText: {
        marginTop: 12,
        fontSize: 15,
        color: COLORS.textLight,
    }
});'''

new_list_style = '''    emptyStateText: {
        marginTop: 12,
        fontSize: 15,
        color: COLORS.textLight,
    },

    // Notifications List
    notificationsList: {
        marginTop: 16,
        maxHeight: 450,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2EE',
    },
    trendIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationInfo: {
        flex: 1,
        marginLeft: 14,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    notificationMsg: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 4,
        lineHeight: 18,
    },
    notificationTime: {
        fontSize: 11,
        color: '#B0B0B0',
        marginTop: 6,
    },
    percentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        marginLeft: 12,
    },
    percentText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
});'''

content = content.replace(old_list_style, new_list_style)

with open('app/src/screens/BiddingScreen.js', 'w', encoding='utf-8') as f:
    f.write(content)
