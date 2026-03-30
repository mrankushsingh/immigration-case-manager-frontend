import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
};

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured()) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
    } else {
      app = getApps()[0];
      auth = getAuth(app);
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    auth = null;
  }
} else {
  console.warn('Firebase not configured. Using fallback authentication.');
}

export { auth };

// Helper functions
export async function loginWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase is not configured. Please set Firebase environment variables.');
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
}

export async function logout() {
  if (!auth) {
    return; // No-op if Firebase not configured
  }
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
}

export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    // If Firebase not configured, call callback with null immediately
    callback(null);
    return () => {}; // Return no-op unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken(): Promise<string | null> {
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (error) {
    return null;
  }
}

export function isFirebaseAvailable(): boolean {
  return auth !== null;
}

