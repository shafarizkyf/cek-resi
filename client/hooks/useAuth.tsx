"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, signInWithGoogle, sendEmailLink, confirmEmailLink, isSignInWithEmailLink } from "@/lib/firebase";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  hasWaybills: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  confirmEmailSignIn: (email: string) => Promise<string>;
  signOut: () => Promise<void>;
  updateHasWaybills: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || baseUrl === '/api') {
    return path;
  }
  return `${baseUrl}${path}`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(`${getApiUrl('/api/auth/verify')}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          
          if (res.ok) {
            const data = await res.json();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              hasWaybills: data.data.hasWaybills,
            });
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSignInWithEmail = async (email: string) => {
    await sendEmailLink(email);
  };

  const handleConfirmEmailSignIn = async (email: string) => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error('Invalid email link');
    }
    const idToken = await confirmEmailLink(email, window.location.href);
    return idToken;
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const updateHasWaybills = (value: boolean) => {
    if (user) {
      setUser({ ...user, hasWaybills: value });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        confirmEmailSignIn: handleConfirmEmailSignIn,
        signOut: handleSignOut,
        updateHasWaybills,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
