import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/Theme';
import { User, Lock, ArrowRight } from 'lucide-react-native';
import { apiFetch } from '../lib/api';
import { saveUserData } from '../utils/session';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }

        setLoading(true);
        try {
            const data = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            await saveUserData(data);
            navigation.replace('MainTabs');
        } catch (error) {
            Alert.alert('Login Failed', error.message || 'Unable to sign in right now.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Top Section with Graphic Design Elements */}
                <View style={styles.topSection}>
                    <View style={styles.circleGraphic1} />
                    <View style={styles.circleGraphic2} />

                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logo}
                                resizeMode="cover"
                                defaultSource={{ uri: 'https://via.placeholder.com/150' }}
                            />
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to your tea plantation assistant</Text>
                    </View>
                </View>

                {/* Bottom Section with Form */}
                <View style={styles.bottomSection}>
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <View style={styles.inputContainer}>
                                <User color={COLORS.primary} size={22} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    placeholderTextColor={COLORS.textLight + '80'}
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock color={COLORS.primary} size={22} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.textLight + '80'}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                    <ArrowRight color={COLORS.white} size={20} />
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>New to Smart Tea Assistant? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary, // Top half is primary branded color
    },
    keyboardView: {
        flex: 1,
    },
    topSection: {
        flex: 0.45,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    circleGraphic1: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -width * 0.5,
        right: -width * 0.2,
    },
    circleGraphic2: {
        position: 'absolute',
        width: width,
        height: width,
        borderRadius: width * 0.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -width * 0.3,
        left: -width * 0.2,
    },
    headerContainer: {
        alignItems: 'center',
        zIndex: 1,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
    },
    logoContainer: {
        width: 110,
        height: 110,
        backgroundColor: COLORS.white,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.padding * 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
        padding: 5, // White border effect
        overflow: 'hidden'
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
        fontFamily: FONTS.regular,
    },
    bottomSection: {
        flex: 0.55,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: SIZES.padding * 2.5,
        paddingTop: SIZES.padding * 3,
    },
    inputGroup: {
        marginBottom: SIZES.padding * 1.5,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        paddingHorizontal: SIZES.padding,
        height: 60,
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SIZES.padding * 2.5,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SIZES.padding * 3,
    },
    registerText: {
        color: COLORS.textLight,
        fontSize: 15,
        fontFamily: FONTS.regular,
    },
    registerLink: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
});

export default LoginScreen;
