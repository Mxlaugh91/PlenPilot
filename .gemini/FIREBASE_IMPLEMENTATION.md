# Firebase Migration - Implementation Guide

**Versjon:** 1.0
**Status:** Step-by-step implementation guide with code snippets
**For:** PlenPilot developers starting Firebase migration

---

## Quick Start (15 minutter)

Hvis du bare vil ha den raske versjonen:

### 1. Install Firebase

```bash
npm install firebase
```

### 2. Opprett `src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. Opprett `.env.local`

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Update `src/features/auth/authService.ts`

Erstatt innholdet med:

```typescript
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword, signOut, type UserCredential, type AuthError as FirebaseAuthError } from 'firebase/auth';
import type { User, AuthError, AuthErrorCode } from './types';

function mapFirebaseError(error: FirebaseAuthError): AuthError {
  const errorMap: Record<string, { code: AuthErrorCode; message: string }> = {
    'auth/invalid-credential': { code: 'auth/invalid-credentials', message: 'Feil e-post eller passord' },
    'auth/user-not-found': { code: 'auth/user-not-found', message: 'Bruker ikke funnet' },
    'auth/wrong-password': { code: 'auth/invalid-credentials', message: 'Feil e-post eller passord' },
    'auth/invalid-email': { code: 'auth/invalid-email', message: 'E-postadressen er ugyldig' },
    'auth/weak-password': { code: 'auth/weak-password', message: 'Passord må være minst 6 tegn' },
  };

  return errorMap[error.code] || {
    code: 'auth/unknown-error',
    message: error.message || 'En ukjent feil oppstod',
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const role = (idTokenResult.claims.role as 'admin' | 'employee') || 'employee';

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        role,
        displayName: firebaseUser.displayName || undefined,
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL,
        createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined,
      };
    } catch (error) {
      throw mapFirebaseError(error as FirebaseAuthError);
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },
};
```

### 5. Update `src/features/auth/AuthProvider.tsx`

Erstatt `useEffect` som initialiserer auth:

```typescript
import { onAuthStateChanged, type Unsubscribe } from 'firebase/auth';
import { auth } from '../../config/firebase';

// Erstatt hele den første useEffect:
useEffect(() => {
  const unsubscribe: Unsubscribe = onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const role = (idTokenResult.claims.role as 'admin' | 'employee') || 'employee';

        setState({
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role,
            displayName: firebaseUser.displayName || undefined,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined,
          },
          loading: false,
          error: null,
        });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    }
  );

  return () => unsubscribe();
}, []);
```

Done! Test nå med `npm run dev`

---

## Step-by-Step Implementation (Detailed)

### Steg 1: Firebase Project Setup

#### 1.1 Opprett Firebase Project

1. Gå til https://console.firebase.google.com
2. Klikk **"Add project"**
3. Navn: `plen-pilot` (eller ditt valg)
4. Velg region: `Europe (eu-west1)`
5. Google Analytics: Can skip
6. Klikk **"Create project"** og vent 2-3 minutter

#### 1.2 Registrer Web App

1. I Firebase Console, gå til **Project Settings** (gear-ikon øverst til venstre)
2. Under **"Your apps"**, klikk **"Add app"** og velg **Web** (</>)
3. Navn: `PlenPilot Web`
4. Klikk **"Register app"**
5. Kopier config-objektet som vises

Eksempel config (din vil ha dine egne verdier):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDx_y_ZaBC123XyZaBcDeF456GhIjKlMnO",
  authDomain: "plen-pilot.firebaseapp.com",
  projectId: "plen-pilot",
  storageBucket: "plen-pilot.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};
```

#### 1.3 Enable Authentication

1. I Firebase Console, gå til **"Authentication"**
2. Klikk **"Get Started"**
3. Velg **"Email/Password"**
4. Slå på **"Email/Password"**
5. Slå på **"Email Link Sign-in"** (for passordgjenoppretting senere)
6. Klikk **"Save"**

#### 1.4 Create Test Users

1. I **"Users"** tabell, klikk **"Add User"**
2. Opprett:
   - Email: `admin@plen.no`, Password: `admin123Secure!`
   - Email: `ansatt@plen.no`, Password: `ansatt123Secure!`

### Steg 2: Code Changes

#### 2.1 Install Firebase SDK

```bash
npm install firebase
```

Verify:
```bash
npm list firebase
# Should show: firebase@^10.0.0 or later
```

#### 2.2 Create Firebase Config

Lag fil: `src/config/firebase.ts`

```typescript
/**
 * Firebase Configuration
 * Initialize Firebase with environment variables
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase config not complete. Check .env.local');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

#### 2.3 Create .env.local

Lag fil: `.env.local` (Git ignored)

```env
# Firebase Configuration
# Get values from: Firebase Console → Project Settings → Your apps
VITE_FIREBASE_API_KEY=AIzaSyDx_y_ZaBC123XyZaBcDeF456GhIjKlMnO
VITE_FIREBASE_AUTH_DOMAIN=plen-pilot.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=plen-pilot
VITE_FIREBASE_STORAGE_BUCKET=plen-pilot.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

**Hent verdiene fra Firebase Console:**
1. Gå til Project Settings
2. Scroll ned til "Your apps"
3. Du finner alle verdier under Web app config

#### 2.4 Update authService.ts

Lag backup først:
```bash
git checkout -b backup/authservice-before-firebase
```

Erstatt hele `src/features/auth/authService.ts` med:

```typescript
/**
 * Firebase Authentication Service
 * Replaces mock authentication with real Firebase calls
 */

import { auth } from '../../config/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
  type AuthError as FirebaseAuthError,
} from 'firebase/auth';
import type { User, AuthError, AuthErrorCode } from './types';

/**
 * Map Firebase errors to our error format
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
  return (
    mapped || {
      code: 'auth/unknown-error',
      message: error.message || 'En ukjent feil oppstod',
    }
  );
}

export const authService = {
  /**
   * Login with Firebase Auth
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const credential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = credential.user;
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const role = (idTokenResult.claims.role as 'admin' | 'employee') || 'employee';

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
      throw mapFirebaseError(error as FirebaseAuthError);
    }
  },

  /**
   * Logout with Firebase Auth
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.error('Logout error:', firebaseError);
      throw mapFirebaseError(firebaseError);
    }
  },
};
```

#### 2.5 Update AuthProvider.tsx

Erstatt første `useEffect` i `AuthProvider.tsx`:

```typescript
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { auth } from '../../config/firebase';
import { onAuthStateChanged, type Unsubscribe } from 'firebase/auth';
import type { AuthContextValue, AuthState, User, AuthError } from './types';
import { authService } from './authService';

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /**
   * Initialize Firebase auth listener on mount
   * This replaces the localStorage-based approach
   */
  useEffect(() => {
    const unsubscribe: Unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // User is signed in - fetch custom claims
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
          console.error('Auth state error:', error);
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

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Keep rest of AuthProvider the same (login, logout, clearError functions)
  // ... existing code ...
}
```

### Steg 3: Test Migrasjonen

```bash
# Install og start
npm install
npm run dev

# Test login
# 1. Gå til http://localhost:5173
# 2. Email: admin@plen.no
# 3. Password: admin123Secure!
# 4. Klikk Login

# Sjekk browser console for errors
# Verifikasjon: Du skal være logget inn
```

**Debug-kommandoer (i browser console):**

```javascript
// Check current user
console.log(firebase.auth().currentUser?.email);

// Check token claims
firebase.auth().currentUser?.getIdTokenResult()
  .then(result => console.log('Custom claims:', result.claims));

// Check auth state listener
// (Should see messages in console when logging in/out)
```

### Steg 4: Setup Custom Claims (Roller)

Roller (admin/employee) settes via Cloud Functions. For now, du kan bruke standard "employee" rolle og oppdatere manuelt senere.

#### 4.1 Manual Role Setup (Temporært)

I Firebase Console:
1. Gå til **Authentication** → **Users**
2. Klikk på `admin@plen.no`
3. Klikk **"Custom claims"**Edit-knapp
4. Legg til:
```json
{
  "role": "admin"
}
```
5. Gjør samme for `ansatt@plen.no` med `"role": "employee"`

Etter manual oppdatering: Logout og login igjen for å se rollen.

#### 4.2 Automate med Cloud Functions (Senere)

Se FIREBASE.md kapitel 6 for fullstendig setup.

### Steg 5: Finalize

```bash
# Type check
npx tsc --noEmit

# Build for production
npm run build

# Check dist folder
ls -la dist/
```

---

## Common Issues & Fixes

### Issue: ".env.local not loaded"

**Symptom:** `VITE_FIREBASE_API_KEY is not defined`

**Fix:**
```bash
# 1. Make sure .env.local exists in root folder
ls -la .env.local

# 2. Variables must start with VITE_
# ✅ VITE_FIREBASE_API_KEY=...
# ❌ FIREBASE_API_KEY=...

# 3. Restart dev server
npm run dev
```

### Issue: "Firebase not initialized"

**Symptom:** `Error: Firebase App named "[DEFAULT]" already exists`

**Fix:**
```typescript
// Make sure you're only calling initializeApp once
// Check if it's being called multiple times

// Good:
export const app = initializeApp(firebaseConfig);

// Bad:
initializeApp(firebaseConfig); // Called multiple times
export const app = getAuth(); // Gets default app
```

### Issue: "Login fails with 'Feil e-post eller passord'"

**Symptom:** Can't login even with correct credentials

**Fix:**
```bash
# 1. Check Firebase Console → Authentication → Users
#    Are your test users there?

# 2. Re-create test users:
#    - Delete old ones
#    - Create new: admin@plen.no / admin123Secure!

# 3. Check .env.local has correct values
#    - Copy from Firebase Console exactly

# 4. Restart dev server
npm run dev
```

### Issue: "Session not persisting after refresh"

**Symptom:** After login and refresh, back to login page

**Fix:**
```typescript
// Make sure onAuthStateChanged is setup
// Should be in AuthProvider useEffect

// Good pattern:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Load custom claims
      const claims = await user.getIdTokenResult();
      // Set state
    }
  });
  return () => unsubscribe(); // Important!
}, []);
```

### Issue: "Custom claims showing as undefined"

**Symptom:** `idTokenResult.claims.role` is undefined

**Fix:**
```bash
# 1. Custom claims were not set
#    Go to Firebase Console → Authentication → Users
#    Edit user → Custom claims

# 2. After setting claims, user must refresh token
#    Option A: Logout and login again
#    Option B: In code:
firebase.auth().currentUser?.getIdTokenResult(true) // Force refresh

# 3. Check Cloud Function logs if using automation:
firebase functions:log
```

---

## File Checklist

Verify these files exist after migration:

```bash
# Config
✅ src/config/firebase.ts

# Environment
✅ .env.local (not in git)
✅ .env.example (in git)
✅ .gitignore (includes .env.local)

# Auth Module (unchanged from before)
✅ src/features/auth/authService.ts (UPDATED)
✅ src/features/auth/AuthProvider.tsx (UPDATED)
✅ src/features/auth/useAuth.ts (unchanged)
✅ src/features/auth/types.ts (unchanged)
✅ src/features/auth/LoginPage.tsx (unchanged)
✅ src/features/auth/index.ts (unchanged)

# Git
✅ Commit message: "feat: Migrate to Firebase Authentication"
```

---

## Next Steps

1. **Immediate:** Test login/logout works
2. **Short-term:** Setup Cloud Functions for automated role management
3. **Medium-term:** Add password reset email
4. **Long-term:** Setup App Check for security

---

## Additional Resources

- [Firebase Auth SDK Docs](https://firebase.google.com/docs/auth/web/start)
- [React Firebase Patterns](https://www.freecodecamp.org/news/how-to-use-firebase-with-react/)
- [Custom Claims](https://firebase.google.com/docs/auth/admin-sdk-custom-claims)
- [Error Codes Reference](https://firebase.google.com/docs/auth/admin/errors)

---

**Need help?** See main FIREBASE.md document for detailed troubleshooting section (kap. 11).
