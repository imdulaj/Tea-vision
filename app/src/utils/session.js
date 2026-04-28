import AsyncStorage from '@react-native-async-storage/async-storage';

export const USER_STORAGE_KEY = 'userData';

export const normalizeUserData = (payload = {}) => ({
    user_id: payload.user_id ?? payload.id ?? null,
    user_name: payload.user_name ?? payload.username ?? '',
    email: payload.email ?? '',
    phone_number: payload.phone_number ?? payload.phone ?? '',
    profile_picture_url: payload.profile_picture_url ?? payload.profile_image_url ?? '',
});

export const saveUserData = async (payload) => {
    const normalized = normalizeUserData(payload);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
};

export const getUserData = async () => {
    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
};

export const getUserId = async () => {
    const userData = await getUserData();
    return userData?.user_id ?? null;
};

export const clearUserData = async () => {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
};
