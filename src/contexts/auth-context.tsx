
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithRedirect, signOut, setPersistence, browserLocalPersistence, GoogleAuthProvider, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


// Extend the Firebase User type to include our UserProfile info
export type AppUser = User & Pick<UserProfile, 'name' | 'avatarUrl' | 'profileUrl'>;

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on mount to check auth state and handle redirect results.
    const processAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User has just signed in via redirect.
          // onAuthStateChanged will handle setting the user state.
          toast({ title: "Signed In", description: "You have successfully signed in." });
        }
      } catch (error) {
        console.error("Error getting redirect result", error);
        toast({ title: "Sign-in Failed", description: "Could not complete the sign-in process. Please try again.", variant: 'destructive' });
      }

      // Set up the listener for subsequent auth state changes.
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const appUser: AppUser = {
                ...firebaseUser,
                name: firebaseUser.displayName || 'Anonymous',
                avatarUrl: firebaseUser.photoURL || `https://placehold.co/40x40.png`,
                profileUrl: `/profile/${firebaseUser.uid}`,
            };
            setUser(appUser);
            
            // Ensure user profile is in localStorage
            const knownUsers: UserProfile[] = JSON.parse(localStorage.getItem('knownUsers') || '[]');
            const userExists = knownUsers.some(u => u.uid === firebaseUser.uid);
            if (!userExists) {
                const newUserProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || 'Anonymous',
                    email: firebaseUser.email,
                    avatarUrl: firebaseUser.photoURL || 'https://placehold.co/40x40.png',
                    profileUrl: `/profile/${firebaseUser.uid}`,
                };
                knownUsers.push(newUserProfile);
                localStorage.setItem('knownUsers', JSON.stringify(knownUsers));
            }
          } else {
            setUser(null);
          }
          setLoading(false);
      });
      
      return unsubscribe;
    };
    
    processAuth();

  }, [toast]);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true); // Set loading to true before redirect
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, googleProvider);
      // The user will be redirected. The logic in useEffect will handle the result.
    } catch (error: any) {
       console.error("Error initiating sign in with Google redirect", error);
       toast({ title: "Sign-in Failed", description: "Could not start the sign-in process. Please try again.", variant: 'destructive' });
       setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // The redirect is handled on the page where logout is called
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const value = { user, loading, signInWithGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
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
