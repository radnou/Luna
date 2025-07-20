import { useState, useEffect, useContext, createContext } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const userCredential = await authService.signIn(email, password);
    setUser(userCredential.user);
  };

  const signUp = async (email: string, password: string) => {
    const userCredential = await authService.signUp(email, password);
    setUser(userCredential.user);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateUserProfile = async (profile: { displayName?: string; photoURL?: string }) => {
    if (user) {
      await authService.updateProfile(profile);
      // Update local user state
      setUser({
        ...user,
        displayName: profile.displayName || user.displayName,
        photoURL: profile.photoURL || user.photoURL,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};