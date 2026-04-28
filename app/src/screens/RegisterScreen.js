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
    ScrollView,
    SafeAreaView,
    Image,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/Theme';
import { User, Lock, Mail, Phone, ArrowLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../lib/api';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null); // Local URI for preview
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true, // Request base64
        });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
        }
    };

    const handleRegister = async () => {
        if (!username || !email || !phone || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('password', password);

            if (profilePicture) {
                const uriParts = profilePicture.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append('profile_picture', {
                    uri: profilePicture,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            await apiFetch('/register', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            Alert.alert('Success', 'Registration successful! Please login.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            Alert.alert('Registration Failed', error.message || 'Unable to create the account.');
            console.error('Registration error:', error);
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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft color={COLORS.text} size={24} />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us and get started</Text>
                    </View>

                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            {profilePicture ? (
                                <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <Camera color={COLORS.primary} size={30} />
                                    <Text style={styles.placeholderText}>Add Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <User color={COLORS.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor={COLORS.textLight}
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Mail color={COLORS.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor={COLORS.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Phone color={COLORS.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                placeholderTextColor={COLORS.textLight}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock color={COLORS.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={COLORS.textLight}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.registerButtonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: SIZES.padding * 2,
    },
    backButton: {
        marginLeft: SIZES.padding,
        marginTop: SIZES.padding,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        paddingHorizontal: SIZES.padding * 2,
        marginTop: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: 5,
        fontFamily: FONTS.regular,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    imagePicker: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        borderWidth: 2,
        borderColor: COLORS.primaryLight,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: COLORS.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: SIZES.padding * 2,
        paddingTop: SIZES.padding * 2,
        paddingBottom: SIZES.padding * 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        marginBottom: SIZES.padding,
        height: 55,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.padding,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    registerButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SIZES.padding * 2,
    },
    loginText: {
        color: COLORS.textLight,
        fontSize: 15,
        fontFamily: FONTS.regular,
    },
    loginLink: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
});

export default RegisterScreen;
