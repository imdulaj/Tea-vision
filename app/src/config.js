const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const fallbackBaseUrl = 'http://192.168.0.111:8080';

export const API_BASE_URL = (configuredBaseUrl || fallbackBaseUrl).replace(/\/+$/, '');
export const REQUEST_TIMEOUT_MS = 20000;
export const DEFAULT_API_HEADERS = {
    'ngrok-skip-browser-warning': 'true',
};
