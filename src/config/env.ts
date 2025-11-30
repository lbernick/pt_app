const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const DEFAULT_APP_MODE = 'regular';

export type AppMode = 'onboarding' | 'regular';

export const config = {
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL,
  appMode: (process.env.EXPO_PUBLIC_APP_MODE || DEFAULT_APP_MODE) as AppMode,
};
