/**
 * Base URL of the engine service (services/engine/service.py).
 *
 * Web dev talks to localhost. On a physical device via Expo Go, localhost is the
 * phone, not your machine, so set EXPO_PUBLIC_API_URL to your computer's LAN IP,
 * e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:8000 npm start`.
 */
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
