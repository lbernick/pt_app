import React, { createContext, useContext, useState, useEffect } from "react";
import auth, {
  FirebaseAuthTypes,
  connectAuthEmulator,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  signOut,
} from "@react-native-firebase/auth";
import { AuthContextType, AuthProviderProps } from "../types/auth";
import { config } from "../config/env";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authInstance = auth();

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configure Firebase Auth Emulator if enabled
    if (config.useFirebaseEmulator) {
      console.log(
        `Using Firebase Auth Emulator at ${config.firebaseEmulatorHost}:${config.firebaseEmulatorPort}`,
      );
      connectAuthEmulator(
        authInstance,
        `http://${config.firebaseEmulatorHost}:${config.firebaseEmulatorPort}`,
      );
    }

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(authInstance, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(authInstance, email, password);
  };

  const signOutFn = async () => {
    await signOut(authInstance);
  };

  const getIdTokenFn = async (): Promise<string | null> => {
    if (!user) return null;
    return getIdToken(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut: signOutFn,
        getIdToken: getIdTokenFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
