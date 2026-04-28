import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/Theme';
import { User, Mail, Phone, LogOut } from 'lucide-react-native';
import { clearUserData, getUserData } from '../utils/session';

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
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Profile Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerBackground}>
                        <View style={styles.circle1} />
                        <View style={styles.circle2} />
                    </View>
                    
                    <View style={styles.profileHeaderContent}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={profile_picture_url ? { uri: profile_picture_url } : require('../../assets/icon.png')}
                                style={styles.profileImage}
                            />
                        </View>
                        <Text style={styles.userName}>{user_name || 'User Name'}</Text>
                        <Text style={styles.userRole}>Plantation Manager</Text>
                    </View>
                </View>

                {/* Info Cards Section */}
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <User color={COLORS.primary} size={20} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Full Name</Text>
                                <Text style={styles.infoValue}>{user_name || 'Not provided'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Mail color={COLORS.primary} size={20} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{email || 'Not provided'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Phone color={COLORS.primary} size={20} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Phone Number</Text>
                                <Text style={styles.infoValue}>{phone_number || 'Not provided'}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <LogOut color={COLORS.danger} size={20} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    
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
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: 20,
        fontFamily: FONTS.regular,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: SIZES.radius,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    headerSection: {
        height: 280,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 220,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -50,
        right: -50,
    },
    circle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -30,
        left: -40,
    },
    profileHeaderContent: {
        alignItems: 'center',
        width: '100%',
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
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.white,
        backgroundColor: COLORS.lightGray,
    },
    editImageBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.secondary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    userRole: {
        fontSize: 14,
        color: COLORS.primary,
        marginTop: 4,
        fontFamily: FONTS.medium,
        fontWeight: '600',
    },
    contentSection: {
        paddingHorizontal: SIZES.padding * 1.5,
        paddingTop: SIZES.padding,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        fontFamily: FONTS.bold,
        marginBottom: 15,
        marginTop: 10,
    },
    infoCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SIZES.padding,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: SIZES.padding * 1.5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '15', // light primary background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 4,
        fontFamily: FONTS.regular,
    },
    infoValue: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
        fontFamily: FONTS.medium,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 5,
        marginLeft: 59, // Aligns with the text, skipping icon
    },
    settingsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SIZES.padding,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: SIZES.padding * 2,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingsText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        fontFamily: FONTS.medium,
        fontWeight: '500',
    },
    settingsArrow: {
        opacity: 0.5,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.danger + '30',
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: SIZES.padding,
        shadowColor: COLORS.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: FONTS.bold,
    },
});

export default ProfileScreen;
