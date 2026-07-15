/**
 * Service endpoints.
 *
 * The app talks to two backends:
 *  - API_BASE: the Node API (auth, scan persistence, history). The signed-in
 *    flow (POST /scans then poll GET /scans/:id) goes here.
 *  - ENGINE_BASE: the Python engine's /analyze endpoint. The guest/demo flow
 *    calls it directly so the app stays demoable without the full stack.
 *
 * On a physical device via Expo Go, localhost is the phone, not your machine,
 * so set EXPO_PUBLIC_API_URL / EXPO_PUBLIC_ENGINE_URL to your computer's LAN IP,
 * e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npm start`.
 */
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
export const ENGINE_BASE = process.env.EXPO_PUBLIC_ENGINE_URL ?? 'http://localhost:8000';
