const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export const config = {
  // Non-secret configuration (safe to log)
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL,

  // Secrets (should not be logged)
  authToken: process.env.EXPO_PUBLIC_AUTH_TOKEN,
};

// Safe config that excludes secrets (for logging purposes)
export const safeConfig = {
  backendUrl: config.backendUrl,
};
