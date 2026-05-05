import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/Theme';
import { User, Mail, Phone, LogOut, Edit3, Settings, ChevronRight } from 'lucide-react-native';
import { clearUserData, getUserData } from '../utils/session';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const data = await getUserData();
            setUserData(data);
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearUserData();
                            navigation.replace('Login');
                        } catch (error) {
                            console.error('Error during logout:', error);
                            Alert.alert('Error', 'Failed to logout properly');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>No profile data found. Please log in again.</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={styles.retryButtonText}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { user_name, email, phone_number, profile_picture_url } = userData;

    return (
        <SafeAreaView style={styles.container}>
            {/* Fixed Floating Header */}
            <View style={styles.headerContainer}>
                <LinearGradient colors={['#1B5E20', '#2E7D32', '#43A047']} style={styles.floatingHeader}>
                    <View style={styles.headerTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitleMain}>Profile</Text>
                            <Text style={styles.headerSub}>Manage your account settings</Text>
                        </View>
                        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
                            <Settings color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Profile Picture Card */}
                <View style={styles.profileCard}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={profile_picture_url ? { uri: profile_picture_url } : require('../../assets/icon.png')}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity style={styles.editImageBtn}>
                            <Edit3 color="#fff" size={16} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user_name || 'User Name'}</Text>
                    <Text style={styles.userRole}>Plantation Manager</Text>
                </View>

                {/* Info Cards Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(27, 94, 32, 0.1)' }]}>
                                <User color="#1B5E20" size={20} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Full Name</Text>
                                <Text style={styles.infoValue}>{user_name || 'Not provided'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(27, 94, 32, 0.1)' }]}>
                                <Mail color="#1B5E20" size={20} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{email || 'Not provided'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(27, 94, 32, 0.1)' }]}>
                                <Phone color="#1B5E20" size={20} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Phone Number</Text>
                                <Text style={styles.infoValue}>{phone_number || 'Not provided'}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Account</Text>
                    
                    <View style={styles.infoCard}>
                        <TouchableOpacity style={styles.menuRow}>
                            <View style={[styles.iconBox, { backgroundColor: '#F5F5F5' }]}>
                                <Settings color={COLORS.textLight} size={20} />
                            </View>
                            <Text style={styles.menuText}>App Settings</Text>
                            <ChevronRight color={COLORS.textLight} size={20} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
                            <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                                <LogOut color="#C62828" size={20} />
                            </View>
                            <Text style={[styles.menuText, { color: '#C62828' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Padding for bottom tab spacing */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F5', // Match app background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7F5',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#1B5E20',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerContainer: {
        backgroundColor: '#F5F7F5',
        zIndex: 10,
    },
    floatingHeader: {
        marginHorizontal: 16,
        marginTop: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        marginBottom: 10,
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
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: 10,
    },
    profileCard: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#fff',
        backgroundColor: '#E0E0E0',
    },
    editImageBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2E7D32',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 3,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    userRole: {
        fontSize: 14,
        color: '#1B5E20',
        marginTop: 4,
        fontWeight: '600',
    },
    sectionContainer: {
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        marginTop: 10,
        marginLeft: 8,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 60,
    },
});

export default ProfileScreen;
