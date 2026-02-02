# Firebase Migration Guide for PlenPilot

**Versjon:** 1.0
**Dato:** 02.02.2026
**Status:** Comprehensive migration guide
**Målgruppe:** Backend developers, DevOps engineers, Tech leads

---

## 1. Oversikt

### Hva skal gjøres?

Migrere PlenPilot fra en mock authentication-system til Firebase Authentication, med støtte for:
- Email/password authentication
- Session management med persistent tokens
- Custom claims for role-based access control (RBAC)
- Security rules for Firestore
- Multi-device support
- Token refresh automatisk

### Hvorfor Firebase?

**Dagens system (Mock):**
- Lagrer bruker i `localStorage` som JSON
- Ingen sikkerhet på token eller session
- Ingen real-time listener
- Vanskeligere å skalere
- Ingen cloud-basert session management

**Firebase:**
- Industry-standard authentication
- Secure token management
- Automatic token refresh
- Multi-device login handling
- Offline support med automatic sync
- App Check for bot protection
- Firestore integration
- Google Cloud integrasjon for custom claims via Cloud Functions

### Migration Impact

**Kode som endrer seg:**
- ✅ `src/features/auth/authService.ts` - Bytt mock til Firebase SDK
- ✅ `src/features/auth/AuthProvider.tsx` - Legg til `onAuthStateChanged` listener
- ✅ Ny fil: `src/config/firebase.ts` - Firebase config
- ✅ Ny fil: `functions/setCustomClaims.ts` - Cloud Function for roller

**Kode som IKKE endrer seg:**
- ✅ `src/features/auth/types.ts` - Samme interfaces
- ✅ `src/features/auth/useAuth.ts` - Samme hook
- ✅ `src/features/auth/LoginPage.tsx` - Samme UI
- ✅ `src/features/auth/index.ts` - Samme exports

---

## 2. Pre-Migration Checklist

Gjennomfør disse stegene før du starter migrasjonen:

### 2.1 Testing av Current Implementation

- [ ] **Verifiser mock auth-system fungerer**
  ```bash
  npm run dev
  # Test login med admin@plen.no / admin123
  # Test login med ansatt@plen.no / ansatt123
  # Test logout
  # Test persistence (refresh page, bruker skal fortsatt være logget inn)
  ```

- [ ] **Kjør type-check**
  ```bash
  npx tsc --noEmit
  # Skal ikke ha noen errors
  ```

### 2.2 Firebase Project Setup

- [ ] **Opprett Firebase Project**
  - Gå til [Firebase Console](https://console.firebase.google.com)
  - Klikk "Add Project"
  - Navn: `plen-pilot` eller `plen-pilot-dev`
  - Velg region (for EU: `europe-west1`)
  - Aktivér Google Analytics (valgfritt)

- [ ] **Registrer Web App**
  - I Firebase Console, velg ditt prosjekt
  - Gå til "Project Settings" (gear-ikon)
  - Under "Your apps", klikk "Add app"
  - Velg "Web" (</>)
  - Navn: `PlenPilot Web`
  - Kopier Firebase Config (gjør det tilgjengelig senere)

- [ ] **Aktivér Authentication Method**
  - I Firebase Console, gå til "Authentication"
  - Klikk "Get Started"
  - Velg "Email/Password"
  - Aktivér "Email/Password"
  - Aktivér "Email Link Sign-in" (for password reset)

- [ ] **Opprett Test Users**
  - I Firebase Console, gå til "Authentication" → "Users"
  - Klikk "Add User"
  - Opprett:
    - Email: `admin@plen.no`, Password: `admin123Secure!`
    - Email: `ansatt@plen.no`, Password: `ansatt123Secure!`

### 2.3 Dependencies

- [ ] **Install Firebase SDK**
  ```bash
  npm install firebase
  ```

- [ ] **Install Firebase CLI (for Cloud Functions)**
  ```bash
  npm install -g firebase-tools
  # eller: npx firebase-tools
  ```

### 2.4 Environment Variables

Forbered følgende filer:

- [ ] `.env.local` (Git ignored)
  ```env
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```

- [ ] `.env.example` (For version control)
  ```env
  VITE_FIREBASE_API_KEY=placeholder
  VITE_FIREBASE_AUTH_DOMAIN=placeholder
  # ... rest av keys
  ```

### 2.5 Backup Current Code

```bash
# Lag en branch for backup
git checkout -b backup/mock-auth-system
git push origin backup/mock-auth-system

# Switch tilbake til master
git checkout master
```

---

## 3. Firebase Setup

### 3.1 Install Dependencies

```bash
# Installer Firebase SDK
npm install firebase

# Installer Firebase CLI for Cloud Functions
npm install -g firebase-tools

# Installer TypeScript types for Firebase (hvis ikke allerede installert)
npm install --save-dev @types/node
```

### 3.2 Firebase Config File

Opprett `src/config/firebase.ts`:

```typescript
/**
 * Firebase Configuration
 *
 * Initializes Firebase with environment variables.
 * Handles both development and production environments.
 *
 * @packageDocumentation
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import type { Auth, Firestore } from 'firebase/auth';

/**
 * Firebase configuration from environment variables
 *
 * Get these values from Firebase Console:
 * Project Settings → Your apps → Config
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required environment variables
if (!firebaseConfig.apiKey) {
  throw new Error(
    'Firebase configuration incomplete. Check .env.local file and VITE_FIREBASE_* variables.'
  );
}

/**
 * Initialize Firebase App
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Auth
 *
 * Use this instance in your auth service
 */
export const auth: Auth = getAuth(app);

/**
 * Initialize Firestore
 *
 * Use this for storing user metadata, roles, etc.
 */
export const db: Firestore = getFirestore(app);

/**
 * Development Only: Connect to Firebase Emulator
 *
 * To use Firebase Emulator Suite locally:
 * 1. Install: npm install -g firebase-tools
 * 2. Start emulator: firebase emulator:start
 * 3. Port defaults: Auth=9099, Firestore=8080
 */
if (import.meta.env.DEV && !auth.emulatorConfig) {
  // Uncomment to use Firebase Emulator locally
  // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
```

### 3.3 Update `.env.local`

Basert på Firebase Console config:

```env
# Firebase Configuration
# Get these from: Firebase Console → Project Settings → Your apps → Config
VITE_FIREBASE_API_KEY=AIzaSyDx_y_ZaBC123XyZaBcDeF456GhIjKlMnO
VITE_FIREBASE_AUTH_DOMAIN=plen-pilot.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=plen-pilot
VITE_FIREBASE_STORAGE_BUCKET=plen-pilot.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

### 3.4 Add `.env.local` to `.gitignore`

```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "chore: Add .env.local to gitignore"
```

---

## 4. Fase 1: Core Authentication

### Mål
Implementer basic email/password authentication med Firebase.

### 4.1 Update `authService.ts`

Erstatt mock-implementeringen:

```typescript
/**
 * Firebase Authentication Service
 *
 * Provides authentication operations using Firebase Auth.
 * Handles login, logout, and error mapping.
 *
 * @packageDocumentation
 */

import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
  type AuthError as FirebaseAuthError,
} from 'firebase/auth';
import type { User, AuthError, AuthErrorCode } from './types';

/**
 * Map Firebase error codes to our standardized error codes
 */
function mapFirebaseError(error: FirebaseAuthError): AuthError {
  const errorMap: Record<string, { code: AuthErrorCode; message: string }> = {
    'auth/invalid-email': {
      code: 'auth/invalid-email',
      message: 'E-postadressen er ugyldig',
    },
    'auth/user-disabled': {
      code: 'auth/user-disabled',
      message: 'Denne kontoen er deaktivert',
    },
    'auth/user-not-found': {
      code: 'auth/user-not-found',
      message: 'Bruker ikke funnet',
    },
    'auth/wrong-password': {
      code: 'auth/invalid-credentials',
      message: 'Feil e-post eller passord',
    },
    'auth/invalid-credential': {
      code: 'auth/invalid-credentials',
      message: 'Feil e-post eller passord',
    },
    'auth/weak-password': {
      code: 'auth/weak-password',
      message: 'Passord må være minst 6 tegn',
    },
    'auth/email-already-in-use': {
      code: 'auth/email-already-in-use',
      message: 'E-posten er allerede i bruk',
    },
    'auth/too-many-requests': {
      code: 'auth/too-many-requests',
      message: 'For mange forsøk. Prøv igjen senere.',
    },
    'auth/network-error': {
      code: 'auth/network-error',
      message: 'Nettverksfeil. Sjekk internettforbindelsen.',
    },
  };

  const mapped = errorMap[error.code];
  if (mapped) {
    return mapped;
  }

  // Fallback for unknown errors
  return {
    code: 'auth/unknown-error',
    message: error.message || 'En ukjent feil oppstod',
  };
}

/**
 * Firebase Authentication Service
 *
 * Replaces the mock implementation with real Firebase Auth calls.
 */
export const authService = {
  /**
   * Login with email and password
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise that resolves with User object
   * @throws AuthError if credentials are invalid
   *
   * @example
   * ```typescript
   * try {
   *   const user = await authService.login('admin@plen.no', 'password123');
   *   console.log('Logged in as:', user.email);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   * ```
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      // Sign in with Firebase
      const credential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = credential.user;

      // Get custom claims for role (set via Cloud Functions)
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const role = (idTokenResult.claims.role as 'admin' | 'employee') || 'employee';

      // Map Firebase user to our User interface
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        role,
        displayName: firebaseUser.displayName || undefined,
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL,
        createdAt: firebaseUser.metadata.creationTime
          ? new Date(firebaseUser.metadata.creationTime)
          : undefined,
      };
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw mapFirebaseError(firebaseError);
    }
  },

  /**
   * Logout current user
   *
   * @returns Promise that resolves when logout is complete
   *
   * @example
   * ```typescript
   * await authService.logout();
   * console.log('User logged out');
   * ```
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.error('Logout failed:', firebaseError.message);
      throw mapFirebaseError(firebaseError);
    }
  },
};
```

### 4.2 Update `package.json`

Sjekk at Firebase er installert:

```json
{
  "dependencies": {
    "firebase": "^10.0.0",
    // ... other dependencies
  }
}
```

### 4.3 Test Phase 1

```bash
# Start development server
npm run dev

# Test login
# Email: admin@plen.no
# Password: admin123Secure! (fra Firebase Console)

# Test logout
# Click logout button

# Test persistence
# Login, refresh page
# Should still be logged in
```

**Debugging:**
```typescript
// I browser console:
// Sjekk current user
firebase.auth().currentUser

// Sjekk ID token claims
firebase.auth().currentUser.getIdTokenResult()
  .then(result => console.log(result.claims))
```

---

## 5. Fase 2: Session Management

### Mål
Implementer automatic session restoration med `onAuthStateChanged`.

### 5.1 Update `AuthProvider.tsx`

Erstatt localStorage-basert persistence med Firebase listener:

```typescript
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, type Unsubscribe } from 'firebase/auth';
import type { AuthContextValue, AuthState, User, AuthError } from './types';
import { authService } from './authService';

/**
 * Authentication Context
 *
 * Provides authentication state and methods to all components in the app.
 * Use the `useAuth()` hook to access this context.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Manages global authentication state using Firebase Auth.
 * Handles:
 * - Real-time user authentication state (onAuthStateChanged)
 * - Login/logout operations
 * - Automatic session restoration
 * - Loading states during authentication transitions
 * - Error handling with custom error messages
 *
 * This component wraps the entire application to provide auth context.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Authentication state
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true, // Start as loading to check for persisted session
    error: null,
  });

  /**
   * Initialize Firebase auth listener on mount
   *
   * This hook sets up a real-time listener that:
   * 1. Checks for existing authenticated user (session restoration)
   * 2. Updates state when user logs in/out
   * 3. Cleans up the listener on unmount
   *
   * Firebase handles token refresh automatically behind the scenes.
   */
  useEffect(() => {
    // Set up real-time auth state listener
    const unsubscribe: Unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // User is signed in
            // Fetch custom claims for role
            const idTokenResult = await firebaseUser.getIdTokenResult();
            const role = (idTokenResult.claims.role as 'admin' | 'employee') || 'employee';

            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role,
              displayName: firebaseUser.displayName || undefined,
              emailVerified: firebaseUser.emailVerified,
              photoURL: firebaseUser.photoURL,
              createdAt: firebaseUser.metadata.creationTime
                ? new Date(firebaseUser.metadata.creationTime)
                : undefined,
            };

            setState({
              user,
              loading: false,
              error: null,
            });
          } else {
            // User is signed out
            setState({
              user: null,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          setState({
            user: null,
            loading: false,
            error: {
              code: 'auth/unknown-error',
              message: 'Feil ved gjenoppretting av session',
            },
          });
        }
      },
      (error) => {
        // Handle auth listener errors
        console.error('Auth listener error:', error);
        setState({
          user: null,
          loading: false,
          error: {
            code: 'auth/unknown-error',
            message: 'Autentiseringsfeil oppstod',
          },
        });
      }
    );

    // Cleanup: Unsubscribe from listener on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Login function
   *
   * Authenticates user with email and password.
   * Updates state on success or error.
   *
   * @param email - User's email address
   * @param password - User's password
   * @throws AuthError if login fails - caller should handle with try/catch
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      // Set loading state
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null, // Clear any previous errors
      }));

      try {
        // Call auth service
        const user = await authService.login(email, password);

        // Update state
        // Note: Firebase auth state will be updated by onAuthStateChanged listener,
        // but we update here for consistency
        setState({
          user,
          loading: false,
          error: null,
        });
      } catch (error) {
        // Handle authentication error
        const authError = error as AuthError;

        setState({
          user: null,
          loading: false,
          error: authError,
        });

        // Re-throw to allow caller to handle if needed
        throw authError;
      }
    },
    []
  );

  /**
   * Logout function
   *
   * Signs out user from Firebase.
   * The onAuthStateChanged listener will automatically update the state.
   */
  const logout = useCallback(async (): Promise<void> => {
    // Set loading state
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // Call auth service
      await authService.logout();

      // Note: onAuthStateChanged listener will handle state update
      // We set loading state here just in case
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      // Even if logout fails, clear state
      console.warn('Logout failed:', error);

      setState({
        user: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Clear error function
   *
   * Clears the current error state.
   * Useful for dismissing error messages.
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Context value
   * Combines state with action methods
   * Memoized to prevent unnecessary re-renders
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      clearError,
      isAuthenticated: state.user !== null,
    }),
    [state, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### 5.2 Test Phase 2

```bash
# Test automatic session restoration
# 1. Login
# 2. Refresh page - should still be logged in without loading screen
# 3. Open DevTools → Application → Cookies
#    Should see Firebase session cookies
# 4. Login in one tab, check if other tabs update in real-time
# 5. Clear cookies manually and refresh - should go to login page
```

**Debugging:**
```typescript
// Monitor auth state changes
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user?.email);
});
```

---

## 6. Fase 3: Custom Claims og Roller

### Mål
Implementer role-based access control (RBAC) med Firebase custom claims via Cloud Functions.

### 6.1 Setup Cloud Functions

**1. Initialize Firebase Functions:**

```bash
# I prosjekt-roten
firebase init functions

# Velg:
# - Typescript
# - ESLint: Yes
# - Install dependencies: Yes
```

**2. Opprett Cloud Function for Setting Custom Claims:**

Opprett `functions/src/setCustomClaims.ts`:

```typescript
/**
 * Cloud Function to Set Custom Claims for Users
 *
 * This function sets the 'role' claim on user tokens.
 * Called when a user is created to assign their role.
 *
 * Usage:
 * Call this function via HTTP or triggered by Firestore
 * POST /setCustomClaims
 * Body: { uid: string, role: 'admin' | 'employee' }
 *
 * In production, this should be called via:
 * 1. Admin panel when creating users
 * 2. Firestore trigger when user document is created
 * 3. Firebase Admin SDK in backend service
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const setCustomClaims = functions.https.onCall(
  async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Check if user is admin (for production)
    // In development, you might skip this check
    // const userDoc = await admin
    //   .firestore()
    //   .collection('users')
    //   .doc(context.auth.uid)
    //   .get();
    // if (userDoc.data()?.role !== 'admin') {
    //   throw new functions.https.HttpsError(
    //     'permission-denied',
    //     'Only admins can set claims'
    //   );
    // }

    const { uid, role } = data;

    if (!uid || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'uid and role are required'
      );
    }

    if (!['admin', 'employee'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'role must be admin or employee'
      );
    }

    try {
      // Set custom claims
      await admin.auth().setCustomUserClaims(uid, { role });

      return {
        success: true,
        message: `Set role claim to ${role} for user ${uid}`,
      };
    } catch (error) {
      console.error('Error setting custom claims:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to set custom claims'
      );
    }
  }
);

/**
 * Trigger to Set Initial Role on User Creation
 *
 * When a new user is created in Authentication,
 * automatically create a Firestore document with default role.
 * Admin can then update the role via setCustomClaims.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user document in Firestore
    await admin
      .firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        email: user.email,
        role: 'employee', // Default role
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName || null,
      });

    // Set initial custom claim
    await admin.auth().setCustomUserClaims(user.uid, { role: 'employee' });

    console.log(`Created user document and set role for ${user.uid}`);
  } catch (error) {
    console.error('Error in onUserCreated:', error);
  }
});

/**
 * Trigger to Update Custom Claims when Firestore Role Changes
 *
 * When a user's role is updated in Firestore,
 * automatically update their custom claims.
 */
export const onUserRoleChanged = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only update if role changed
    if (before?.role === after?.role) {
      return;
    }

    const userId = change.after.id;
    const newRole = after?.role || 'employee';

    try {
      await admin.auth().setCustomUserClaims(userId, { role: newRole });
      console.log(`Updated role claim for ${userId} to ${newRole}`);
    } catch (error) {
      console.error('Error updating custom claims:', error);
    }
  });
```

**3. Deploy Functions:**

```bash
# Login to Firebase
firebase login

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log --limit=50
```

### 6.2 Firestore Collection Schema

Opprett Firestore collection `users` med struktur:

```typescript
/**
 * Firestore users collection schema
 *
 * Document ID: Same as Firebase Auth UID
 * Path: /users/{uid}
 */
interface FirestoreUser {
  email: string;
  displayName?: string;
  photoURL?: string | null;
  role: 'admin' | 'employee';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
  disabled?: boolean;
}

// Example document:
{
  "email": "admin@plen.no",
  "displayName": "Admin User",
  "photoURL": null,
  "role": "admin",
  "createdAt": "2026-02-01T10:00:00Z",
  "updatedAt": "2026-02-01T10:00:00Z",
  "lastLogin": "2026-02-02T15:30:00Z",
  "disabled": false
}
```

### 6.3 Update Firestore Security Rules

I Firebase Console, gå til Firestore → Rules, oppdater:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Users can read their own document
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId &&
        (request.resource.data.role == resource.data.role); // Can't change own role
    }

    // Only admins can update user roles
    match /users/{userId} {
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Admins can read all users
    match /users/{userId} {
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 6.4 Test Phase 3

```bash
# 1. Login as admin@plen.no
# 2. In browser console:
const user = await firebase.auth().currentUser.getIdTokenResult();
console.log(user.claims);
// Should show: { role: 'admin' }

# 3. Login as ansatt@plen.no
# 4. Check claims again
# Should show: { role: 'employee' }

# 5. In Firebase Console, update role in Firestore
# Go to Firestore → users collection
# Edit ansatt@plen.no document, change role to 'admin'
# Next login should have updated role
```

---

## 7. Fase 4: Security

### 7.1 Firebase App Check

Beskytt backend fra bots og uautorisert tilgang:

**1. Enable App Check in Firebase Console:**
- Authentication → App Check → Get Started
- Choose provider: "reCAPTCHA v3"
- Click "Create Key"

**2. Add App Check to Frontend (`src/config/firebase.ts`):**

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Initialize App Check
if (!self.FIREBASE_APPCHECK_DEBUG_TOKEN) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY
    ),
    isTokenAutoRefreshEnabled: true,
  });
}
```

**3. Add Environment Variable:**

```env
VITE_RECAPTCHA_V3_SITE_KEY=your_site_key
```

### 7.2 Firestore Security Rules

**Production Rules:**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Check if user exists and has role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return getUserRole() == 'admin';
    }

    function isEmployee() {
      return getUserRole() == 'employee';
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow update: if request.auth.uid == userId && !('role' in request.resource.data);
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }

    // Employee collections
    match /teams/{teamId}/members/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

### 7.3 Authentication Security Rules

**In Firebase Console → Authentication → Sign-in method:**

- ✅ Email/Password: Enabled
- ✅ Email Enumeration Protection: Enabled
- ✅ Limit duplicate accounts: Enabled
- ✅ Max login attempts: 5 (default)
- ✅ Block after 15 minutes of too many failed attempts

### 7.4 Password Requirements

I Firebase Console → Authentication → Password Policy:

- Minimum length: 8 characters
- Require uppercase: Yes
- Require numbers: Yes
- Require special characters: No (for user-friendliness)

---

## 8. Fase 5: User Management

### 8.1 Password Reset

Oppdater `authService.ts` med password reset:

```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

export const authService = {
  // ... existing login/logout ...

  /**
   * Send password reset email
   *
   * @param email - User's email address
   * @throws AuthError if email not found
   */
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw mapFirebaseError(firebaseError);
    }
  },

  /**
   * Verify password reset code
   *
   * @param code - Code from reset email
   * @returns Email associated with reset code
   */
  verifyPasswordResetCode: async (code: string): Promise<string> => {
    try {
      return await verifyPasswordResetCode(auth, code);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw mapFirebaseError(firebaseError);
    }
  },

  /**
   * Confirm password reset
   *
   * @param code - Code from reset email
   * @param newPassword - New password
   */
  confirmPasswordReset: async (
    code: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw mapFirebaseError(firebaseError);
    }
  },
};
```

### 8.2 Email Verification

```typescript
import { sendEmailVerification } from 'firebase/auth';

export const authService = {
  // ... existing methods ...

  /**
   * Send email verification
   *
   * Sends verification email to current user
   */
  sendEmailVerification: async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw createAuthError(
        'auth/no-current-user',
        'Ingen bruker er logget inn'
      );
    }

    try {
      await sendEmailVerification(currentUser);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw mapFirebaseError(firebaseError);
    }
  },
};
```

### 8.3 User Profile Update

```typescript
import { updateProfile, updateEmail } from 'firebase/auth';

export const authService = {
  // ... existing methods ...

  /**
   * Update user profile
   *
   * @param updates - Profile updates (displayName, photoURL)
   */
  updateUserProfile: async (updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw createAuthError(
        'auth/no-current-user',
        'Ingen bruker er logget inn'
      );
    }

    try {
      await updateProfile(currentUser, updates);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw mapFirebaseError(firebaseError);
    }
  },

  /**
   * Update user email
   *
   * @param newEmail - New email address
   */
  updateEmail: async (newEmail: string): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw createAuthError(
        'auth/no-current-user',
        'Ingen bruker er logget inn'
      );
    }

    try {
      await updateEmail(currentUser, newEmail);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      throw mapFirebaseError(firebaseError);
    }
  },
};
```

---

## 9. Testing

### 9.1 Unit Tests

Opprett `src/features/auth/__tests__/authService.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { authService } from '../authService';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';

describe('authService', () => {
  const testEmail = 'test-user-001@example.com';
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Create test user in Firebase
    try {
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    } catch (error) {
      // User might already exist
      console.log('Test user setup note:', error);
    }
  });

  afterAll(async () => {
    // Clean up test user
    const currentUser = auth.currentUser;
    if (currentUser?.email === testEmail) {
      await deleteUser(currentUser);
    }
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const user = await authService.login(testEmail, testPassword);

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.id).toBeDefined();
      expect(user.role).toBe('employee'); // Default role
    });

    it('should throw error with invalid password', async () => {
      try {
        await authService.login(testEmail, 'WrongPassword123!');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe('auth/invalid-credentials');
      }
    });

    it('should throw error with non-existent email', async () => {
      try {
        await authService.login('nonexistent@example.com', 'Password123!');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe('auth/user-not-found');
      }
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // First login
      await authService.login(testEmail, testPassword);

      // Then logout
      await authService.logout();

      expect(auth.currentUser).toBeNull();
    });
  });
});
```

### 9.2 E2E Tests

Opprett `tests/auth.e2e.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../src/features/auth/LoginPage';
import { AuthProvider } from '../src/features/auth/AuthProvider';

describe('Authentication E2E', () => {
  it('should login and navigate to dashboard', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Find email input
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    // Enter credentials
    fireEvent.change(emailInput, { target: { value: 'admin@plen.no' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123Secure!' } });

    // Click login button
    const loginButton = screen.getByText(/login/i);
    fireEvent.click(loginButton);

    // Wait for redirect
    await waitFor(() => {
      expect(screen.queryByText(/welcome/i)).toBeInTheDocument();
    });
  });

  it('should show error with invalid credentials', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Enter invalid credentials
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Click login
    const loginButton = screen.getByText(/login/i);
    fireEvent.click(loginButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/feil e-post eller passord/i)).toBeInTheDocument();
    });
  });

  it('should persist session after page refresh', async () => {
    // This test would require a headless browser (Playwright, Cypress)
    // Simplified version shown
    const { rerender } = render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Login
    // ... login flow ...

    // Simulate refresh by remounting
    rerender(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Should still be logged in
    await waitFor(() => {
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    });
  });
});
```

### 9.3 Manual Testing Checklist

- [ ] **Local Development**
  - [ ] Login with valid credentials works
  - [ ] Login with invalid credentials shows error
  - [ ] Session persists after page refresh
  - [ ] Logout clears session
  - [ ] Can switch between multiple user accounts

- [ ] **Cloud Deployment**
  - [ ] Can login from production domain
  - [ ] App Check is working (check DevTools Network)
  - [ ] Custom claims are being set correctly
  - [ ] Firestore security rules are working

- [ ] **Cross-Device**
  - [ ] Login on phone syncs to desktop
  - [ ] Logout on one device logs out on all devices (if multi-device support is enabled)

- [ ] **Error Scenarios**
  - [ ] Network error shows "Nettverksfeil"
  - [ ] Too many login attempts triggers rate limiting
  - [ ] Disabled user account shows appropriate error
  - [ ] Database down shows graceful error

---

## 10. Deployment

### 10.1 Production Checklist

Before deploying to production:

- [ ] **Firebase Configuration**
  - [ ] Environment variables set in production
  - [ ] Firebase project is in production mode (not test mode)
  - [ ] App Check is enabled with reCAPTCHA v3
  - [ ] Authentication providers are enabled

- [ ] **Security Rules**
  - [ ] Firestore rules reviewed and tested
  - [ ] Authentication rules are strict (deny by default)
  - [ ] No hardcoded test credentials in code
  - [ ] `.env.local` is in `.gitignore`

- [ ] **Code**
  - [ ] Mock auth code is removed/disabled
  - [ ] Type-check passes: `npx tsc --noEmit`
  - [ ] Build passes: `npm run build`
  - [ ] No console.errors in production build

- [ ] **Testing**
  - [ ] Login/logout works in production build
  - [ ] Session persistence works
  - [ ] Error handling works
  - [ ] Custom claims are set

- [ ] **Monitoring**
  - [ ] Firebase Analytics is enabled
  - [ ] Error tracking is setup (Firebase Crashlytics)
  - [ ] Logs are configured for Cloud Logging

### 10.2 Deploy to Firebase Hosting

**1. Setup Firebase Hosting:**

```bash
firebase init hosting

# Select:
# - Use existing Firebase project: Yes
# - Public directory: dist
# - Single-page app: Yes
# - Automatic rewrites for spa: Yes
```

**2. Update `firebase.json`:**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(css|js)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=1year"
          }
        ]
      }
    ]
  }
}
```

**3. Deploy:**

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting

# Check deployment
firebase open hosting:site
```

### 10.3 Environment Setup

**Development (.env.local):**
```env
VITE_FIREBASE_API_KEY=dev_key...
VITE_FIREBASE_PROJECT_ID=plen-pilot-dev
```

**Production (.env.production):**
```env
VITE_FIREBASE_API_KEY=prod_key...
VITE_FIREBASE_PROJECT_ID=plen-pilot
```

---

## 11. Troubleshooting

### Authentication Issues

**Problem:** "Cannot find module 'firebase'"
```bash
# Solution: Install Firebase
npm install firebase
```

**Problem:** "VITE_FIREBASE_API_KEY is not defined"
```bash
# Solution: Check .env.local exists with all Firebase variables
# Make sure variables start with VITE_ prefix
```

**Problem:** "User logged out immediately after login"
```typescript
// Solution: Check if onAuthStateChanged is being called
// Add debug logging to AuthProvider:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user?.email); // Debug log
    // ... rest of handler
  });
  return () => unsubscribe();
}, []);
```

**Problem:** "Custom claims not showing up"
```bash
# Solution:
# 1. Verify Cloud Function is deployed: firebase functions:log
# 2. Check Firestore document exists: Console → Firestore
# 3. Try re-login to refresh token: User might have old token
# 4. In browser console:
firebase.auth().currentUser.getIdTokenResult(true)
  .then(result => console.log(result.claims))
```

**Problem:** "Too many requests / Rate limited"
```typescript
// Solution: Firebase auto-handles this
// Your error handler should show:
// "For mange forsøk. Prøv igjen senere."
// Wait 15 minutes before trying again
```

### Firestore Issues

**Problem:** "Permission denied" when reading user document
```firestore
// Solution: Check Firestore rules
// Rules at /users/{userId} should allow read if request.auth.uid == userId
```

**Problem:** "Document not found"
```bash
# Solution:
# 1. User document should be created by onUserCreated trigger
# 2. If missing, manually create in Firestore:
#    Collection: users
#    Document ID: (Firebase UID)
#    Fields: email, role, createdAt
```

### Email/Password Issues

**Problem:** "Email already in use"
```typescript
// Solution: This is expected if trying to create duplicate account
// Check Firebase Console → Authentication → Users to see existing users
```

**Problem:** "Weak password"
```typescript
// Solution: Password must meet Firebase requirements:
// - At least 6 characters (or custom minimum set in Console)
// - Should include uppercase, numbers for stronger password
```

### Deployment Issues

**Problem:** "Function deployment fails"
```bash
# Solution: Check Cloud Functions error
firebase functions:log --limit=100

# Common issues:
# - Node version mismatch (use Node 18+)
# - Missing firebase-admin: npm install firebase-admin
# - Syntax errors: npm run build in functions folder
```

**Problem:** "Hosted app shows blank page"
```bash
# Solution: Check build output
ls -la dist/
# dist/ should have index.html, assets/, etc.

# Check Firebase Console → Hosting → Deployments
# Look for error messages in deployment
```

---

## 12. Migrasjon fra Mock til Firebase - Oppsummering

### Filer som endres

| Fil | Endring | Kompleksitet |
|-----|--------|-------------|
| `src/config/firebase.ts` | **Ny** - Firebase initialization | Lav |
| `src/features/auth/authService.ts` | Bytt mock → Firebase SDK | Lav |
| `src/features/auth/AuthProvider.tsx` | Legg til `onAuthStateChanged` | Lav |
| `functions/src/setCustomClaims.ts` | **Ny** - Cloud Functions for roles | Medium |
| `.env.local` | **Ny** - Firebase credentials | Lav |
| `firebase.json` | **Ny** - Firebase config | Lav |

### Filer som IKKE endres

- `src/features/auth/types.ts` - Samme interfaces
- `src/features/auth/useAuth.ts` - Samme hook
- `src/features/auth/LoginPage.tsx` - Samme UI
- `src/features/auth/index.ts` - Samme exports
- `src/App.tsx` - Samme routing

### Migration Timeline

| Fase | Tidsestimate | Fokus |
|------|-------------|-------|
| **Fase 1** | 1-2 timer | Core authentication |
| **Fase 2** | 1 time | Session management |
| **Fase 3** | 2-3 timer | Custom claims & Cloud Functions |
| **Fase 4** | 1-2 timer | Security rules |
| **Fase 5** | 1-2 timer | User management features |
| **Fase 6** | 2-3 timer | Testing & bug fixes |
| **Fase 7** | 1-2 timer | Deployment |
| **TOTAL** | **9-15 timer** | - |

### Success Criteria

- ✅ Login works with real Firebase credentials
- ✅ Session persists after page refresh
- ✅ Custom claims (role) are set correctly
- ✅ Security rules are working
- ✅ Error messages are shown to user
- ✅ Mobile works (responsive design)
- ✅ All existing features still work
- ✅ No console errors

---

## Ressurser

### Dokumentasjon
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)

### Tools
- [Firebase Console](https://console.firebase.google.com)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

### Best Practices
- [Firebase Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-query)
- [Authentication Best Practices](https://cloud.google.com/docs/authentication/best-practices)
- [Custom Claims for RBAC](https://cloud.google.com/identity-platform/docs/concepts/authentication)

### Community
- [Firebase Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)
- [Firebase Discord Community](https://discord.gg/firebase)

---

## Kontakt & Support

For spørsmål eller problemer:

1. **Check Troubleshooting Section** - Se kap. 11
2. **Firebase Documentation** - Offisiell docs
3. **Team Communication** - Slack/Discord channel
4. **GitHub Issues** - Report bugs

---

**Version:** 1.0
**Last Updated:** 02.02.2026
**Maintainer:** Tech Lead
