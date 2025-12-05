import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
