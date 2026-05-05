import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal, TextInput, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/Theme';
import { Clock, TrendingUp, TrendingDown, ShoppingBag, Leaf, Gavel, Plus, X, ImagePlus, Bell } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../lib/api';
import { getUserId } from '../utils/session';
const { width } = Dimensions.get('window');

const BiddingScreen = () => {
    const [activeTab, setActiveTab] = useState('live');
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBid, setSelectedBid] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [showBidModal, setShowBidModal] = useState(false);

    // Create Bid State
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
    const [activeNotificationTab, setActiveNotificationTab] = useState('market');
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
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'market'
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

    // Fetch real outbid notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const userId = await getUserId();
            if (!userId) return;
            try {
                const data = await apiFetch(`/notifications/${userId}`);
                if (data && data.notifications && data.notifications.length > 0) {
                    const newAlerts = data.notifications.map(n => ({
                        id: `outbid_${n.id}`,
                        realId: n.id,
                        teaType: 'Outbid Alert',
                        trend: 'down',
                        percentage: 'N/A',
                        message: n.message,
                        time: n.created_at,
                        type: 'outbid'
                    }));

                    setNotifications(prev => {
                        // Avoid adding duplicates if they haven't been marked read yet
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = newAlerts.filter(a => !existingIds.has(a.id));
                        if (uniqueNew.length === 0) return prev;
                        
                        setUnreadCount(count => count + uniqueNew.length);
                        
                        // Show banner for the most recent outbid alert
                        setLatestAlert(uniqueNew[0]);
                        Animated.sequence([
                            Animated.timing(slideAnim, { toValue: 50, duration: 500, useNativeDriver: true }),
                            Animated.delay(4000),
                            Animated.timing(slideAnim, { toValue: -100, duration: 500, useNativeDriver: true })
                        ]).start();

                        return [...uniqueNew, ...prev];
                    });
                }
            } catch (error) {
                console.log("Failed to fetch outbid notifications:", error.message);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [slideAnim]);

    const openNotifications = async () => {
        setUnreadCount(0);
        setShowNotificationsModal(true);

        // Mark outbid alerts as read in backend
        const unreadOutbids = notifications.filter(n => n.type === 'outbid' && !n.isReadBackend);
        for (const alert of unreadOutbids) {
            if (alert.realId) {
                try {
                    await apiFetch(`/notifications/${alert.realId}/read`, { method: 'POST' });
                    alert.isReadBackend = true;
                } catch (e) {
                    console.log("Failed to mark read:", e.message);
                }
            }
        }
    };

    useEffect(() => {
        fetchBids();
        const interval = setInterval(fetchBids, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedBid) {
            const updatedBid = bids.find(b => b.id === selectedBid.id);
            if (updatedBid && updatedBid.currentBid !== selectedBid.currentBid) {
                setSelectedBid(updatedBid);
            }
        }
    }, [bids]);

    const fetchBids = async () => {
        const ts = () => new Date().toISOString();
        console.log(`[${ts()}] INFO  BiddingScreen  Fetching live auction listings...`);
        try {
            const data = await apiFetch('/bids');

            if (data && data.bids) {
                console.log(`[${ts()}] INFO  BiddingScreen  Successfully loaded ${data.bids.length} listings.`);
                // Map the API structure to the structure needed by our existing UI
                const mappedBids = data.bids.map(bid => ({
                    id: bid.id.toString(),
                    title: bid.name || 'Tea Listing',
                    description: bid.description,
                    grade: 'Standard', // API missing this field, using placeholder
                    quantity: 'N/A', // API missing this field, using placeholder
                    currentBid: `Rs. ${bid.current_highest || bid.starting_price} / kg`,
                    timeRemaining: 'Active',
                    bidders: bid.total_bids || 0,
                    image: bid.image_url ? { uri: bid.image_url } : require('../../assets/tea_estate_background.png'),
                    status: (bid.total_bids > 5) ? 'ending_soon' : 'active'
                }));
                setBids(mappedBids);
            }
        } catch (error) {
            console.log(`[${ts()}] ERROR BiddingScreen  Failed to fetch bids:`, error.message);
            Alert.alert('Error', error.message || 'Failed to load auction listings.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        const ts = () => new Date().toISOString();
        if (!bidAmount || isNaN(bidAmount)) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        const userId = await getUserId();
        if (!userId) {
            Alert.alert('Login Required', 'Please sign in again before placing a bid.');
            return;
        }
        
        console.log(`[${ts()}] INFO  BiddingScreen  Placing bid of Rs. ${bidAmount} on item ID ${selectedBid.id}...`);

        try {
            await apiFetch('/place-bid', {
                method: 'POST',
                body: JSON.stringify({
                    bid_id: parseInt(selectedBid.id, 10),
                    user_id: userId,
                    bid_amount: parseFloat(bidAmount),
                }),
            });
            console.log(`[${ts()}] INFO  BiddingScreen  Bid placed successfully.`);
            Alert.alert("Success", "Bid placed successfully");
            setShowBidModal(false);
            setBidAmount('');
            fetchBids();
        } catch (error) {
            console.log(`[${ts()}] ERROR BiddingScreen  Bidding network error:`, error.message);
            Alert.alert("Error", error.message || "Failed to place bid");
        }
    };

    const pickCreateImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setCreateFormData({ ...createFormData, image: result.assets[0].uri });
            }
        } catch (error) {
            Alert.alert("Error", "Failed to select image.");
        }
    };

    const handleCreateBid = async () => {
        const ts = () => new Date().toISOString();
        if (!createFormData.name || !createFormData.starting_price || !createFormData.image) {
            Alert.alert("Error", "Please fill all required fields and select an image.");
            return;
        }

        const userId = await getUserId();
        if (!userId) {
            Alert.alert('Login Required', 'Please sign in again before creating a listing.');
            return;
        }

        console.log(`[${ts()}] INFO  BiddingScreen  Creating new listing: ${createFormData.name}...`);
        setCreatingBid(true);
        try {
            const formData = new FormData();
            formData.append('name', createFormData.name);
            formData.append('description', createFormData.description);
            formData.append('starting_price', createFormData.starting_price);
            formData.append('owner_id', String(userId));

            formData.append('image', {
                uri: createFormData.image,
                name: 'tea_auction.jpg',
                type: 'image/jpeg',
            });

            await apiFetch('/create-bid', {
                method: 'POST',
                body: formData,
            });

            console.log(`[${ts()}] INFO  BiddingScreen  Listing created successfully.`);
            Alert.alert("Success", "Bid listing created successfully!");
            setShowCreateModal(false);
            setCreateFormData({ name: '', description: '', starting_price: '', image: null });
            fetchBids();
        } catch (error) {
            console.log(`[${ts()}] ERROR BiddingScreen  Networking error during creation:`, error.message);
            Alert.alert("Error", error.message || "Network error. Failed to connect to server.");
        } finally {
            setCreatingBid(false);
        }
    };

    // Filter bids based on the active tab
    const getDisplayedBids = () => {
        if (activeTab === 'live') {
            return bids;
        } else if (activeTab === 'my_bids') {
            // Placeholder: filter by owner_id if API returns it, or just return empty/subset for now
            return bids.filter(b => b.status === 'active'); // Assuming user wants to see something
        }
        return [];
    };

    const renderBidItem = (item) => (
        <TouchableOpacity 
            key={item.id} 
            style={styles.bidCard} 
            onPress={() => { setSelectedBid(item); setShowBidModal(true); }}
            activeOpacity={0.95}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, item.status === 'ending_soon' ? styles.badgeEnding : styles.badgeLive]}>
                    <View style={[styles.statusDot, item.status === 'ending_soon' ? { backgroundColor: '#FF5252' } : { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.statusText, item.status === 'ending_soon' ? { color: '#C62828' } : { color: '#2E7D32' }]}>
                        {item.status === 'ending_soon' ? 'ENDING SOON' : 'LIVE AUCTION'}
                    </Text>
                </View>
                <View style={styles.biddersPill}>
                    <TrendingUp size={12} color={COLORS.textLight} />
                    <Text style={styles.biddersCountText}>{item.bidders} Bids</Text>
                </View>
            </View>

            <View style={styles.bidContentLayout}>
                <View style={styles.imageBlock}>
                    <Image source={item.image} style={styles.teaThumb} resizeMode="cover" />
                    <View style={styles.gradeTag}>
                        <Text style={styles.gradeTagText}>{item.grade}</Text>
                    </View>
                </View>

                <View style={styles.detailsBlock}>
                    <Text style={styles.bidTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.bidDesc} numberOfLines={1}>{item.description || 'Premium selection from central estates.'}</Text>
                    
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <ShoppingBag size={12} color={COLORS.textLight} />
                            <Text style={styles.metaText}>Qty: <Text style={styles.metaBold}>{item.quantity}</Text></Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={12} color={item.status === 'ending_soon' ? '#C62828' : COLORS.textLight} />
                            <Text style={[styles.metaText, item.status === 'ending_soon' && { color: '#C62828', fontWeight: 'bold' }]}>
                                {item.timeRemaining}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.currentPriceBox}>
                        <Text style={styles.currentPriceLabel}>Current Bid</Text>
                        <Text style={styles.currentPriceValue}>{item.currentBid}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <LinearGradient
                    colors={['#1B5E20', '#2E7D32']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.actionBtnGradient}
                >
                    <Gavel size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Place Bid Now</Text>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );

    return (
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
                {/* ── Premium Floating Header ─────────────────────── */}
                <LinearGradient colors={['#1B5E20', '#2E7D32', '#43A047']} style={styles.headerGradient}>
                    <View style={styles.headerTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitleMain}>Tea Auction</Text>
                            <Text style={styles.headerSub}>Live Bidding Platform  •  Secure Trades</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7} onPress={openNotifications}>
                            <Bell color="#fff" size={24} />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeTextCount}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerHint}>Participate in real-time global tea auctions</Text>
                </LinearGradient>

                <View style={[styles.headerActionsRow, { paddingHorizontal: 24, marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>Auctions</Text>
                    <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.createBtnCompact}>
                        <Plus color={COLORS.primary} size={16} />
                        <Text style={styles.createBtnTextCompact}>Create Listing</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'live' && styles.activeTab]}
                        onPress={() => setActiveTab('live')}
                    >
                        <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>Live</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'my_bids' && styles.activeTab]}
                        onPress={() => setActiveTab('my_bids')}
                    >
                        <Text style={[styles.tabText, activeTab === 'my_bids' && styles.activeTabText]}>My Bids</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : getDisplayedBids().length > 0 ? (
                    getDisplayedBids().map(renderBidItem)
                ) : (
                    <View style={styles.emptyState}>
                        <Leaf size={48} color={COLORS.textLight} opacity={0.5} />
                        <Text style={styles.emptyStateText}>No active auctions found.</Text>
                    </View>
                )}
            </ScrollView>

            {showBidModal && (
                <Modal animationType="fade" transparent={true} visible={showBidModal}>
                    <View style={styles.modalBlurOverlay}>
                        <View style={styles.modernModalContent}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modernModalTitle}>Place Your Bid</Text>
                                <TouchableOpacity onPress={() => setShowBidModal(false)}>
                                    <X color={COLORS.textLight} size={24} />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.quickInfoBox}>
                                <Text style={styles.quickInfoLabel}>Current Highest</Text>
                                <Text style={styles.quickInfoValue}>{selectedBid?.currentBid}</Text>
                            </View>

                            <Text style={styles.modernInputLabel}>BID AMOUNT (LKR)</Text>
                            <View style={[styles.modernInputWrapper, { marginBottom: 24 }]}>
                                <Gavel color={COLORS.primary} size={20} style={{ marginRight: 12 }} />
                                <TextInput
                                    style={styles.modernCleanInput}
                                    placeholder="e.g. 1550.00"
                                    placeholderTextColor="#B0B0B0"
                                    keyboardType="numeric"
                                    value={bidAmount}
                                    onChangeText={setBidAmount}
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity onPress={handlePlaceBid} style={styles.submitBidBtn}>
                                <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.submitBidBtnGradient}>
                                    <Text style={styles.submitBidBtnText}>Confirm Bid Entry</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Create Bid Modal */}
            {showCreateModal && (
                <Modal animationType="slide" transparent={true} visible={showCreateModal}>
                    <View style={styles.modalBlurOverlay}>
                        <ScrollView contentContainerStyle={styles.createModalScroll}>
                            <View style={styles.modernModalContentLarge}>
                                <View style={styles.modalHeaderRow}>
                                    <View>
                                        <Text style={styles.modernModalTitle}>New Auction Listing</Text>
                                        <Text style={styles.modalSub}>List your harvest to global buyers</Text>
                                    </View>
                                    <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCreateModal(false)}>
                                        <X color={COLORS.textLight} size={24} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.premiumImagePicker} onPress={pickCreateImage} activeOpacity={0.8}>
                                    {createFormData.image ? (
                                        <Image source={{ uri: createFormData.image }} style={styles.fullPreviewImage} />
                                    ) : (
                                        <View style={styles.imagePickerInner}>
                                            <View style={styles.iconCircle}>
                                                <ImagePlus color={COLORS.primary} size={32} />
                                            </View>
                                            <Text style={styles.imagePickerTitle}>Upload Batch Photo</Text>
                                            <Text style={styles.imagePickerHint}>Recommended: High resolution top-view</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <Text style={styles.modernInputLabel}>LISTING NAME</Text>
                                <View style={styles.modernInputWrapper}>
                                    <Leaf color={COLORS.primary} size={18} style={{ marginRight: 12 }} />
                                    <TextInput
                                        style={styles.modernCleanInput}
                                        placeholder="e.g. Premium FBOP Ceylon Tea"
                                        value={createFormData.name}
                                        onChangeText={(text) => setCreateFormData({ ...createFormData, name: text })}
                                    />
                                </View>

                                <Text style={styles.modernInputLabel}>STARTING PRICE (RS. / KG)</Text>
                                <View style={styles.modernInputWrapper}>
                                    <TrendingUp color={COLORS.primary} size={18} style={{ marginRight: 12 }} />
                                    <TextInput
                                        style={styles.modernCleanInput}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        value={createFormData.starting_price}
                                        onChangeText={(text) => setCreateFormData({ ...createFormData, starting_price: text })}
                                    />
                                </View>

                                <Text style={styles.modernInputLabel}>DESCRIPTION & NOTES</Text>
                                <View style={[styles.modernInputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                                    <TextInput
                                        style={[styles.modernCleanInput, { height: '100%' }]}
                                        placeholder="Add details about grade, estate, and plucking date..."
                                        multiline
                                        numberOfLines={4}
                                        value={createFormData.description}
                                        onChangeText={(text) => setCreateFormData({ ...createFormData, description: text })}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreateBid}
                                    style={[styles.submitListingBtn, creatingBid && { opacity: 0.7 }]}
                                    disabled={creatingBid}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.submitListingGradient}>
                                        {creatingBid ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.submitListingText}>Publish to Live Auction</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
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
                                    <Text style={styles.modernModalTitle}>Alerts Center</Text>
                                    <Text style={styles.modalSub}>Market updates and bidding alerts</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                                    <X color={COLORS.textLight} size={24} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tab, activeNotificationTab === 'market' && styles.activeTab]}
                                    onPress={() => setActiveNotificationTab('market')}
                                >
                                    <Text style={[styles.tabText, activeNotificationTab === 'market' && styles.activeTabText]}>Global Market</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, activeNotificationTab === 'outbid' && styles.activeTab]}
                                    onPress={() => setActiveNotificationTab('outbid')}
                                >
                                    <Text style={[styles.tabText, activeNotificationTab === 'outbid' && styles.activeTabText]}>Bidding Alerts</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                                {notifications.filter(n => n.type === activeNotificationTab).length > 0 ? (
                                    notifications.filter(n => n.type === activeNotificationTab).map((notif) => (
                                        <View key={notif.id} style={styles.notificationItem}>
                                            <View style={[styles.trendIconBox, notif.trend === 'up' ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#FFEBEE' }]}>
                                                {notif.trend === 'up' 
                                                    ? <TrendingUp color="#2E7D32" size={20} />
                                                    : <TrendingDown color="#C62828" size={20} />
                                                }
                                            </View>
                                            <View style={styles.notificationInfo}>
                                                <Text style={styles.notificationTitle}>{notif.teaType} {notif.type === 'market' ? 'Market' : ''}</Text>
                                                <Text style={styles.notificationMsg}>{notif.message}</Text>
                                                <Text style={styles.notificationTime}>{notif.time}</Text>
                                            </View>
                                            <View style={[styles.percentBadge, notif.trend === 'up' ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#C62828' }]}>
                                                <Text style={styles.percentText}>{notif.trend === 'up' ? '+' : '-'}{notif.percentage === 'N/A' ? '0.0' : notif.percentage}%</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Bell size={48} color={COLORS.textLight} opacity={0.5} />
                                        <Text style={styles.emptyStateText}>
                                            {activeNotificationTab === 'market' ? 'No market alerts yet.' : 'No bidding alerts yet.'}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F5',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    centerContainer: {
        paddingVertical: 100,
        alignItems: 'center',
    },

    // Header
    headerGradient: {
        marginHorizontal: 16,
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
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitleMain: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    headerHint: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.55)',
        marginTop: 6,
        fontStyle: 'italic',
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
        top: 8,
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

    // Header Actions
    headerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    createBtnCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    createBtnTextCompact: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 6,
    },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        gap: 8,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },

    // Bid Cards
    bidCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    badgeLive: { backgroundColor: '#E8F5E9' },
    badgeEnding: { backgroundColor: '#FFEBEE' },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    biddersPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    biddersCountText: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    bidContentLayout: {
        flexDirection: 'row',
        gap: 16,
    },
    imageBlock: {
        width: 90,
        height: 90,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    teaThumb: {
        width: '100%',
        height: '100%',
    },
    gradeTag: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    gradeTagText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    detailsBlock: {
        flex: 1,
        justifyContent: 'center',
    },
    bidTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    bidDesc: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: COLORS.textLight,
    },
    metaBold: {
        fontWeight: '700',
        color: COLORS.text,
    },
    currentPriceBox: {
        backgroundColor: '#F9FAF9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    currentPriceLabel: {
        fontSize: 9,
        color: COLORS.textLight,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    currentPriceValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cardFooter: {
        marginTop: 16,
        borderRadius: 14,
        overflow: 'hidden',
    },
    actionBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Modals
    modalBlurOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modernModalContent: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 30,
        padding: 24,
        elevation: 10,
    },
    modernModalContentLarge: {
        backgroundColor: '#fff',
        width: '90%',
        borderRadius: 30,
        padding: 24,
        marginVertical: 40,
        elevation: 10,
    },
    modernModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    modalSub: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    quickInfoBox: {
        backgroundColor: '#F5F7F5',
        padding: 16,
        borderRadius: 20,
        marginVertical: 20,
        alignItems: 'center',
    },
    quickInfoLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 4,
    },
    quickInfoValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    modernInputLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 8,
        marginLeft: 4,
    },
    modernInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAF9',
        borderWidth: 1,
        borderColor: '#EEF2EE',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
    },
    modernCleanInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    submitBidBtn: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    submitBidBtnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitBidBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Create Modal Special
    createModalScroll: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    premiumImagePicker: {
        width: '100%',
        height: 180,
        borderRadius: 24,
        backgroundColor: '#F5F7F5',
        borderWidth: 1.5,
        borderColor: '#E8F5E8',
        borderStyle: 'dashed',
        marginBottom: 24,
        marginTop: 20,
        overflow: 'hidden',
    },
    imagePickerInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    imagePickerTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    imagePickerHint: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 4,
    },
    fullPreviewImage: {
        width: '100%',
        height: '100%',
    },
    submitListingBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 10,
    },
    submitListingGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    submitListingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Global Helpers
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
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
});

export default BiddingScreen;
