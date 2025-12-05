import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AuthContextType, AuthProviderProps } from '../types/auth';
import { config } from '../config/env';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configure Firebase Auth Emulator if enabled
    if (config.useFirebaseEmulator) {
      console.log(`Using Firebase Auth Emulator at ${config.firebaseEmulatorHost}:${config.firebaseEmulatorPort}`);
      auth().useEmulator(`http://${config.firebaseEmulatorHost}:${config.firebaseEmulatorPort}`);
    }

    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await auth().createUserWithEmailAndPassword(email, password);
  };

  const signOut = async () => {
    await auth().signOut();
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
