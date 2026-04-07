import axios from 'axios';
import Constants from 'expo-constants';

// Dynamic host IP detection for Expo development
const getDevHost = () => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri) return 'localhost'; // Fallback
    const host = hostUri.split(':')[0];
    return host;
};

// Use the dynamic host if in dev mode, otherwise fallback to local IP
// For local backend development, change this to your machine's local IP
//const HOST_IP = __DEV__ ? '192.168.1.4' : '192.168.1.4'; // Update 192.168.1.10 with your actual LOCAL IP
const HOST_IP = __DEV__ ? '192.168.8.148' : '192.168.8.148'; // Update 192.168.1.10 with your actual LOCAL IP


const API_URL = `http://${HOST_IP}:5001/api`;

console.log('[API] Using API URL:', API_URL);

// Special cases for simulators/emulators if dynamic detection fails:
// Android Emulator: http://10.0.2.2:5001/api
// iOS Simulator / Web: http://localhost:5001/api

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add response logging for debugging
api.interceptors.response.use(
    response => {
        console.log('[API] Response from', response.config.url, ':', response.data);
        return response;
    },
    error => {
        console.error('[API] Error from', error.config?.url, ':', error.message);
        return Promise.reject(error);
    }
);

export default api;

