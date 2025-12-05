const DEFAULT_BACKEND_URL = "http://localhost:8000";

export const config = {
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL,
  // Firebase emulator settings (optional - for local development)
  // Set EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true to use local Firebase Auth emulator
  useFirebaseEmulator: process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
  firebaseEmulatorHost: process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost',
  firebaseEmulatorPort: parseInt(process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_PORT || '9099', 10),
};

// Safe config that excludes secrets (for logging purposes)
export const safeConfig = {
  backendUrl: config.backendUrl,
  useFirebaseEmulator: config.useFirebaseEmulator,
  firebaseEmulatorHost: config.firebaseEmulatorHost,
  firebaseEmulatorPort: config.firebaseEmulatorPort,
};
