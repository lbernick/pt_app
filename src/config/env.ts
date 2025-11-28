const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export const config = {
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL,
};
