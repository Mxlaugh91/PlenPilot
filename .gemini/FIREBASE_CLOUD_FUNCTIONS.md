# Firebase Cloud Functions Setup Guide

**Versjon:** 1.0
**For:** Setting up Cloud Functions for custom claims and user management
**Time estimate:** 1-2 hours

---

## Overview

Cloud Functions vil handle:
1. **setCustomClaims** - Sette rolle (admin/employee) på bruker
2. **onUserCreated** - Opprett Firestore dokument når bruker registreres
3. **onUserRoleChanged** - Oppdater custom claims når rolle endres

---

## 1. Setup Cloud Functions Project

### 1.1 Install Firebase Tools

```bash
# Global install
npm install -g firebase-tools

# Or use npx (no global install needed)
npx firebase-tools --version
```

### 1.2 Initialize Functions

I prosjekt-roten:

```bash
firebase init functions

# Select options:
# ? Which language would you like to use to write Cloud Functions?
#   → TypeScript
# ? Do you want to use ESLint to catch probable bugs and enforce style?
#   → Yes
# ? File functions/package.json already exists. Overwrite?
#   → No
# ? Install dependencies now?
#   → Yes
```

Dette oppretter:
```
functions/
├── src/
│   └── index.ts          (Main function file)
├── .eslintrc.js
├── package.json
└── tsconfig.json
```

### 1.3 Project Structure

Din struktur vil se slik ut:

```
PlenPilot/
├── src/                  (React app)
│   └── features/auth/
├── functions/            (Cloud Functions)
│   ├── src/
│   │   ├── index.ts      (Main - oppdater denne)
│   │   ├── setCustomClaims.ts
│   │   ├── userTriggers.ts
│   │   └── utils.ts
│   ├── package.json
│   └── tsconfig.json
├── .env.local
├── .gitignore
└── firebase.json
```

---

## 2. Create Cloud Functions

### 2.1 Main Index File

Opprett `functions/src/index.ts`:

```typescript
/**
 * Firebase Cloud Functions
 * Handles authentication-related tasks
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import individual functions
export { setCustomClaims } from './setCustomClaims';
export { onUserCreated, onUserRoleChanged } from './userTriggers';
```

### 2.2 Set Custom Claims Function

Opprett `functions/src/setCustomClaims.ts`:

```typescript
/**
 * Cloud Function: setCustomClaims
 *
 * HTTP endpoint to set role claim on a user's token
 *
 * Usage:
 * POST /setCustomClaims
 * Body: {
 *   "uid": "user_uid",
 *   "role": "admin" | "employee"
 * }
 *
 * Call from frontend:
 * const functions = getFunctions();
 * const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
 * await setCustomClaims({ uid: 'abc123', role: 'admin' });
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const setCustomClaims = functions.https.onCall(
  async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to set claims'
      );
    }

    const { uid, role } = data;

    // Validate input
    if (!uid || typeof uid !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'uid is required and must be a string'
      );
    }

    if (!role || !['admin', 'employee'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'role must be "admin" or "employee"'
      );
    }

    // Only admins can set claims for other users
    try {
      const callerToken = await admin
        .auth()
        .getUser(context.auth.uid);

      // For now, skip admin check in development
      // In production, uncomment:
      // const callerDoc = await admin
      //   .firestore()
      //   .collection('users')
      //   .doc(context.auth.uid)
      //   .get();
      // const callerRole = callerDoc.data()?.role;
      // if (callerRole !== 'admin') {
      //   throw new functions.https.HttpsError(
      //     'permission-denied',
      //     'Only admins can set claims'
      //   );
      // }

      // Check if user exists
      await admin.auth().getUser(uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found'
        );
      }
      throw error;
    }

    try {
      // Set custom claims on user's token
      await admin.auth().setCustomUserClaims(uid, { role });

      // Update Firestore document
      const userRef = admin.firestore().collection('users').doc(uid);
      await userRef.update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: `Successfully set role to "${role}" for user ${uid}`,
        timestamp: new Date().toISOString(),
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
```

### 2.3 User Trigger Functions

Opprett `functions/src/userTriggers.ts`:

```typescript
/**
 * Cloud Functions: Auth Triggers
 *
 * Automatically handles user lifecycle events
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Trigger: onUserCreated
 *
 * When a new user is created in Firebase Auth,
 * automatically create a Firestore document with default settings.
 */
export const onUserCreated = functions.auth
  .user()
  .onCreate(async (user) => {
    try {
      console.log(`Creating user document for ${user.uid}`);

      // Create user document in Firestore
      await admin
        .firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          role: 'employee', // Default role
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          emailVerified: user.emailVerified,
          disabled: user.disabled,
        });

      // Set initial custom claim
      await admin.auth().setCustomUserClaims(user.uid, {
        role: 'employee',
      });

      console.log(`User document created for ${user.uid}`);
    } catch (error) {
      console.error(`Error creating user document for ${user.uid}:`, error);
      throw error;
    }
  });

/**
 * Trigger: onUserRoleChanged
 *
 * When a user's role is updated in Firestore,
 * automatically update their custom claims so
 * the new role appears in their next token refresh.
 */
export const onUserRoleChanged = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const userId = change.after.id;

      // Only process if role actually changed
      if (before?.role === after?.role) {
        console.log(`No role change for ${userId}, skipping`);
        return;
      }

      const newRole = after?.role || 'employee';

      console.log(`Updating role for ${userId} to ${newRole}`);

      // Verify new role is valid
      if (!['admin', 'employee'].includes(newRole)) {
        console.warn(
          `Invalid role "${newRole}" for ${userId}, reverting to previous`
        );
        await change.after.ref.update({ role: before?.role });
        return;
      }

      // Update custom claims in Firebase Auth
      await admin.auth().setCustomUserClaims(userId, {
        role: newRole,
      });

      // Update timestamp
      await change.after.ref.update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Successfully updated role for ${userId}`);
    } catch (error) {
      console.error(`Error updating custom claims:`, error);
      throw error;
    }
  });

/**
 * Trigger: onUserDeleted (Optional)
 *
 * When a user is deleted from Firebase Auth,
 * optionally delete their Firestore document.
 */
export const onUserDeleted = functions.auth
  .user()
  .onDelete(async (user) => {
    try {
      console.log(`Deleting user document for ${user.uid}`);

      // Option 1: Hard delete
      await admin
        .firestore()
        .collection('users')
        .doc(user.uid)
        .delete();

      // Option 2: Soft delete (just mark as disabled)
      // await admin
      //   .firestore()
      //   .collection('users')
      //   .doc(user.uid)
      //   .update({
      //     deleted: true,
      //     deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      //   });

      console.log(`User document deleted for ${user.uid}`);
    } catch (error) {
      console.error(`Error deleting user document for ${user.uid}:`, error);
      throw error;
    }
  });
```

### 2.4 Utility Functions

Opprett `functions/src/utils.ts`:

```typescript
/**
 * Utility functions for Cloud Functions
 */

import * as admin from 'firebase-admin';

/**
 * Get user document from Firestore
 */
export async function getUserDocument(uid: string) {
  const doc = await admin
    .firestore()
    .collection('users')
    .doc(uid)
    .get();

  return doc.data();
}

/**
 * Verify user is admin
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  const user = await getUserDocument(uid);
  return user?.role === 'admin';
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const query = await admin
    .firestore()
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (query.empty) {
    return null;
  }

  return query.docs[0].data();
}

/**
 * Update user role
 */
export async function updateUserRole(
  uid: string,
  role: 'admin' | 'employee'
): Promise<void> {
  // Update Firestore
  await admin
    .firestore()
    .collection('users')
    .doc(uid)
    .update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  // Update Auth custom claims
  await admin.auth().setCustomUserClaims(uid, { role });
}
```

---

## 3. Update Firebase Configuration

### 3.1 Update `firebase.json`

Oppdater `firebase.json` for å deploye både app og functions:

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
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "codebase": "default"
  }
}
```

### 3.2 Update `functions/package.json`

Sjekk at disse dependencies finnes:

```json
{
  "name": "functions",
  "description": "Cloud Functions for PlenPilot",
  "engines": {
    "node": "18"
  },
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

Installer hvis nødvendig:

```bash
cd functions
npm install
cd ..
```

---

## 4. Test Cloud Functions Locally

### 4.1 Start Emulator

```bash
# Start Firebase Emulator Suite
firebase emulators:start --only functions,auth,firestore

# Output should show:
# ✔ functions[...]
# ✔ firestore[...]
# ✔ auth[...]
# Emulator Suite has started at localhost:4000
```

### 4.2 Test setCustomClaims Manually

I annen terminal, test funktionen:

```bash
# Call function via curl
curl -X POST http://localhost:5001/plen-pilot/us-central1/setCustomClaims \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "uid": "test-user-001",
      "role": "admin"
    }
  }'

# Or use Firebase CLI
firebase functions:shell
# In shell:
# > setCustomClaims({uid: "test-user-001", role: "admin"})
```

### 4.3 Check Firestore Emulator

1. Gå til http://localhost:4000
2. Klikk **"Firestore"**
3. Sjekk `users` collection
4. Verify documents og custom claims

---

## 5. Deploy to Production

### 5.1 Login to Firebase

```bash
firebase login
```

### 5.2 Select Project

```bash
firebase use plen-pilot

# Or switch projects:
firebase use --add
# Select project from list
```

### 5.3 Deploy Functions

```bash
# Build TypeScript
cd functions
npm run build
cd ..

# Deploy only functions
firebase deploy --only functions

# Or deploy everything
firebase deploy
```

**Output:**
```
✔ functions[setCustomClaims(us-central1)] Successful
✔ functions[onUserCreated(us-central1)] Successful
✔ functions[onUserRoleChanged(us-central1)] Successful

Deploy complete!
```

### 5.4 View Logs

```bash
# Real-time logs
firebase functions:log --lines=50

# Or via Cloud Console
# https://console.cloud.google.com/functions
```

---

## 6. Call Cloud Functions from Frontend

### 6.1 Install Callable Functions SDK

```bash
npm install firebase
```

(Already installed from Step 2)

### 6.2 Create Helper in Frontend

Opprett `src/services/firebaseAdmin.ts`:

```typescript
/**
 * Firebase Admin Functions
 * Call Cloud Functions from frontend
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../config/firebase';

const functions = getFunctions(app);

/**
 * Set user role via Cloud Function
 */
export async function setUserRole(
  uid: string,
  role: 'admin' | 'employee'
): Promise<void> {
  try {
    const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
    await setCustomClaims({ uid, role });
  } catch (error: any) {
    console.error('Error setting user role:', error);
    throw new Error(error.message || 'Failed to set user role');
  }
}

/**
 * Get user document from Firestore
 */
export async function getUserDocument(uid: string) {
  try {
    const getUser = httpsCallable(functions, 'getUser');
    const result = await getUser({ uid });
    return result.data;
  } catch (error: any) {
    console.error('Error getting user:', error);
    throw new Error(error.message || 'Failed to get user');
  }
}
```

### 6.3 Use in Admin Panel

```typescript
// Example: Admin component to change user role
import { setUserRole } from '../services/firebaseAdmin';

export function UserRoleManager({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (newRole: 'admin' | 'employee') => {
    setLoading(true);
    setError(null);

    try {
      await setUserRole(userId, newRole);
      alert('Role updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleRoleChange('admin')} disabled={loading}>
        Make Admin
      </button>
      <button onClick={() => handleRoleChange('employee')} disabled={loading}>
        Make Employee
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## 7. Firestore Collection Schema

### 7.1 Users Collection

**Path:** `/users/{uid}`

```typescript
interface FirestoreUser {
  // Firebase Auth fields
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  disabled: boolean;

  // Custom fields
  role: 'admin' | 'employee';

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;

  // Metadata
  metadata?: {
    loginCount: number;
    lastIPAddress?: string;
  };
}
```

### 7.2 Example Documents

```javascript
// Admin user
{
  email: "admin@plen.no",
  displayName: "Admin User",
  photoURL: null,
  emailVerified: true,
  disabled: false,
  role: "admin",
  createdAt: "2026-02-01T10:00:00Z",
  updatedAt: "2026-02-01T10:00:00Z",
  lastLogin: "2026-02-02T15:30:00Z"
}

// Employee user
{
  email: "ansatt@plen.no",
  displayName: "Employee User",
  photoURL: null,
  emailVerified: true,
  disabled: false,
  role: "employee",
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-02-01T12:00:00Z",
  lastLogin: "2026-02-02T09:15:00Z"
}
```

---

## 8. Security Rules

### 8.1 Complete Firestore Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return request.auth.token.role == 'admin';
    }

    function isEmployee() {
      return request.auth.token.role == 'employee';
    }

    // Default: Deny all
    match /{document=**} {
      allow read, write: if false;
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth.uid == userId;

      // Users can update their own profile (but not role)
      allow update: if request.auth.uid == userId &&
        (request.resource.data.role == resource.data.role);

      // Admins can read and update all user documents
      allow read, update, delete: if isAdmin();
    }

    // Admin-only collection
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }

    // Teams collection
    match /teams/{teamId}/members/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

### 8.2 Deploy Rules

I Firebase Console:
1. Gå til **Firestore Database**
2. Klikk **"Rules"** tab
3. Lim inn reglene over
4. Klikk **"Publish"**

---

## 9. Troubleshooting

### Issue: "Functions not deploying"

**Symptom:** Deploy fails with type errors

**Fix:**
```bash
# Check TypeScript compilation
cd functions
npm run build

# If errors, fix them first
# Then deploy
cd ..
firebase deploy --only functions
```

### Issue: "onUserCreated not triggering"

**Symptom:** User document not created automatically

**Fix:**
```bash
# 1. Check function is deployed
firebase functions:list

# 2. Check logs for errors
firebase functions:log

# 3. Create user and watch logs
firebase functions:log --follow

# 4. If still not working, manually create user document:
# In Firebase Console → Firestore
# Create collection "users" → Document with UID as ID
```

### Issue: "Custom claims not updating"

**Symptom:** `idTokenResult.claims.role` is still old value

**Fix:**
```typescript
// Force token refresh after updating claims
const currentUser = firebase.auth().currentUser;
if (currentUser) {
  // Get fresh token with new claims
  await currentUser.getIdTokenResult(true);
  console.log(currentUser.getIdTokenResult().then(r => r.claims));
}
```

### Issue: "Firestore emulator connection error"

**Symptom:** Functions can't connect to Firestore emulator

**Fix:**
```bash
# Emulator must be running first
firebase emulators:start --only functions,firestore,auth

# Then in new terminal, call functions
# Or start with --export-on-exit to save data
firebase emulators:start --export-on-exit ./emulator-data
```

---

## 10. Monitoring & Maintenance

### 10.1 View Function Metrics

```bash
# Real-time logs
firebase functions:log --lines=100

# Via Firebase Console
# https://console.firebase.google.com/u/0/project/{PROJECT_ID}/functions
```

### 10.2 Update Functions

```bash
# Edit function code
# Then redeploy
firebase deploy --only functions

# Rollback to previous version
firebase functions:delete functionName
# And redeploy previous code
```

### 10.3 Delete Functions

```bash
# Delete single function
firebase functions:delete setCustomClaims

# Delete all in region
firebase functions:delete --region=us-central1
```

---

## 11. Best Practices

1. **Error Handling:** Always wrap in try/catch
2. **Logging:** Use `console.log` for debugging (visible in logs)
3. **Validation:** Validate all input parameters
4. **Permissions:** Check auth before executing
5. **Performance:** Use indexes for Firestore queries
6. **Testing:** Test locally before deploying
7. **Monitoring:** Regular check of function logs
8. **Cleanup:** Remove old functions to reduce costs

---

## Next Steps

1. Deploy functions: `firebase deploy --only functions`
2. Test setCustomClaims from admin panel
3. Setup automatic role assignment
4. Monitor function logs
5. Add more functions as needed (password reset, user reports, etc.)

---

**Questions?** See main FIREBASE.md for complete documentation.
