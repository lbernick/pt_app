const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const DEFAULT_APP_MODE = 'regular';

export type AppMode = 'onboarding' | 'regular';

export const config = {
  // Non-secret configuration (safe to log)
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL,
  appMode: (process.env.EXPO_PUBLIC_APP_MODE || DEFAULT_APP_MODE) as AppMode,

  // Secrets (should not be logged)
  authToken: process.env.EXPO_PUBLIC_AUTH_TOKEN,
};

// Safe config that excludes secrets (for logging purposes)
export const safeConfig = {
  backendUrl: config.backendUrl,
  appMode: config.appMode,
};
