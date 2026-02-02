# Firebase Migration - Implementation Checklist

**Bruk denne lista for å spore din progresjon gjennom migrasjonen**

**Print eller kopier til din favoritt todo-app**

---

## Pre-Migration Setup (Do Once)

### Prerequisites
- [ ] Node.js 18+ installed: `node --version`
- [ ] npm up to date: `npm install -g npm@latest`
- [ ] Git configured: `git config --global user.name "Your Name"`
- [ ] Current branch is clean: `git status` shows no changes

### Team Communication
- [ ] Notified team of migration plan
- [ ] Scheduled migration work
- [ ] Identified who will do each phase
- [ ] Backup plan communicated

### Backup & Git
- [ ] Create backup branch: `git checkout -b backup/pre-firebase`
- [ ] Push backup: `git push origin backup/pre-firebase`
- [ ] Back to master: `git checkout master`
- [ ] Verify master is clean: `git status`

---

## Phase 1: Firebase Project Setup (30 minutes)

### 1.1 Create Firebase Project
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Add Project"
- [ ] Name: `plen-pilot` (or your choice)
- [ ] Region: `Europe (eu-west1)`
- [ ] Click "Create Project"
- [ ] Wait for project creation (2-3 minutes)

### 1.2 Register Web App
- [ ] In Firebase Console, click gear icon → "Project Settings"
- [ ] Under "Your apps", click "Add app"
- [ ] Select Web (</>)
- [ ] Name: `PlenPilot Web`
- [ ] Click "Register app"
- [ ] **Copy entire config object** (you'll need it next)
- [ ] Save config in safe place (email to yourself if needed)

### 1.3 Enable Authentication
- [ ] In Firebase Console, go to "Authentication"
- [ ] Click "Get Started"
- [ ] Click "Email/Password"
- [ ] Enable "Email/Password"
- [ ] Enable "Email Link Sign-in"
- [ ] Click "Save"

### 1.4 Create Test Users
- [ ] Go to "Authentication" → "Users"
- [ ] Click "Add User"
- [ ] Email: `admin@plen.no`
- [ ] Password: `admin123Secure!`
- [ ] Click "Add User"
- [ ] Repeat for `ansatt@plen.no` with password `ansatt123Secure!`
- [ ] Verify both users appear in list

---

## Phase 2: Code Setup (1 hour)

### 2.1 Install Dependencies
- [ ] `npm install firebase`
- [ ] Verify: `npm list firebase` shows version 10+

### 2.2 Create Firebase Config
- [ ] Create file `src/config/firebase.ts`
- [ ] Copy template from FIREBASE_IMPLEMENTATION.md
- [ ] Verify file compiles: `npx tsc --noEmit`

### 2.3 Create Environment Variables
- [ ] Create file `.env.local` in project root
- [ ] Add VITE_FIREBASE_API_KEY = (from config)
- [ ] Add VITE_FIREBASE_AUTH_DOMAIN = (from config)
- [ ] Add VITE_FIREBASE_PROJECT_ID = (from config)
- [ ] Add VITE_FIREBASE_STORAGE_BUCKET = (from config)
- [ ] Add VITE_FIREBASE_MESSAGING_SENDER_ID = (from config)
- [ ] Add VITE_FIREBASE_APP_ID = (from config)
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Create `.env.example` with placeholder values
- [ ] Commit .env.example: `git add .env.example && git commit -m "docs: Add .env.example"`

### 2.4 Verify Configuration
- [ ] `npm run dev` starts without errors
- [ ] Check browser console for errors
- [ ] Check that no auth errors appear

---

## Phase 3: Update Authentication Code (1 hour)

### 3.1 Backup Current Code
- [ ] `git checkout -b feature/firebase-auth`
- [ ] View current authService.ts: `cat src/features/auth/authService.ts`

### 3.2 Update authService.ts
- [ ] Open `src/features/auth/authService.ts`
- [ ] Delete all lines from `export const authService` to end of file
- [ ] Copy new implementation from FIREBASE_IMPLEMENTATION.md Step 4
- [ ] Verify imports: `signInWithEmailAndPassword`, `signOut`, error types
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Check for red squiggles in editor

### 3.3 Update AuthProvider.tsx
- [ ] Open `src/features/auth/AuthProvider.tsx`
- [ ] Locate first `useEffect` (around line 68-101)
- [ ] Replace entire useEffect with new version from FIREBASE_IMPLEMENTATION.md
- [ ] Add import: `import { onAuthStateChanged, type Unsubscribe } from 'firebase/auth';`
- [ ] Add import: `import { auth } from '../../config/firebase';`
- [ ] Remove import: localStorage logic (if separate)
- [ ] Run type check: `npx tsc --noEmit`

### 3.4 Verify Changes Compile
- [ ] `npm run build` completes without errors
- [ ] Check `dist/` folder was created
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

## Phase 4: Test Core Authentication (1 hour)

### 4.1 Start Development Server
- [ ] `npm run dev`
- [ ] Open http://localhost:5173 in browser
- [ ] Check browser console (F12) for errors
- [ ] Should see LoginPage

### 4.2 Test Login with Valid Credentials
- [ ] Enter email: `admin@plen.no`
- [ ] Enter password: `admin123Secure!`
- [ ] Click login button
- [ ] **Expected:** Navigate to AdminDashboard
- [ ] **Check:** Browser console has no errors
- [ ] **Check:** Network tab shows auth requests

### 4.3 Test Login with Invalid Credentials
- [ ] Refresh page (back to LoginPage)
- [ ] Enter email: `invalid@example.com`
- [ ] Enter password: `wrongpassword`
- [ ] Click login button
- [ ] **Expected:** Error message "Feil e-post eller passord"
- [ ] **Check:** Error displays to user
- [ ] **Check:** Not logged in

### 4.4 Test Session Persistence
- [ ] Login with `ansatt@plen.no` / `ansatt123Secure!`
- [ ] **Verify:** Navigate to EmployeeDashboard
- [ ] Refresh page (Cmd+R or Ctrl+R)
- [ ] **Expected:** Still logged in, no flash to LoginPage
- [ ] **Check:** Page loads quickly
- [ ] **Check:** No loading spinner

### 4.5 Test Logout
- [ ] Find logout button in dashboard
- [ ] Click logout
- [ ] **Expected:** Return to LoginPage
- [ ] **Verify:** User data cleared from state
- [ ] Check DevTools → Application → Cookies: `__session` should be gone or expired

### 4.6 Test Multiple Users
- [ ] Login as `admin@plen.no`
- [ ] **Verify:** Dashboard shows admin content
- [ ] Logout
- [ ] Login as `ansatt@plen.no`
- [ ] **Verify:** Dashboard shows employee content
- [ ] Logout
- [ ] Refresh page
- [ ] **Verify:** Back at LoginPage

### 4.7 Console Debugging
- [ ] Open browser console (F12)
- [ ] After login, run: `firebase.auth().currentUser.email`
- [ ] **Should show:** `admin@plen.no` or logged-in email
- [ ] After logout, run: `firebase.auth().currentUser`
- [ ] **Should show:** `null`

### 4.8 Network Tab Inspection
- [ ] Open DevTools → Network tab
- [ ] Clear network log
- [ ] Perform login
- [ ] **Look for:** `signInWithEmailAndPassword` requests
- [ ] **Should see:** POST requests to `identitytoolkit.googleapis.com`
- [ ] Check response: Should be 200 OK
- [ ] No 401 or 403 errors

---

## Phase 5: Commit Phase 1-2 (15 minutes)

### 5.1 Test Everything One More Time
- [ ] All test cases from Phase 4 pass
- [ ] No console errors
- [ ] Type check clean: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`

### 5.2 Review Changes
- [ ] `git status` shows modified files
- [ ] `git diff src/features/auth/authService.ts` looks correct
- [ ] `git diff src/features/auth/AuthProvider.tsx` looks correct
- [ ] `.env.local` is NOT shown (should be gitignored)

### 5.3 Commit Changes
- [ ] `git add src/features/auth/authService.ts`
- [ ] `git add src/features/auth/AuthProvider.tsx`
- [ ] `git add src/config/firebase.ts`
- [ ] `git add .env.example`
- [ ] `git add .gitignore` (if .env.local added)
- [ ] `git commit -m "feat: Migrate to Firebase Authentication"`
- [ ] `git log --oneline` shows your new commit

### 5.4 Backup & Verify
- [ ] `git push origin feature/firebase-auth`
- [ ] Verify on GitHub: commit appears
- [ ] Keep this branch as backup

---

## Phase 6: Cloud Functions Setup (2 hours)

### 6.1 Install Firebase CLI
- [ ] `npm install -g firebase-tools`
- [ ] Verify: `firebase --version` (should be 13.0.0+)

### 6.2 Initialize Functions
- [ ] `firebase init functions`
- [ ] Select existing Firebase project
- [ ] Language: TypeScript
- [ ] ESLint: Yes
- [ ] Install dependencies: Yes
- [ ] Verify `functions/` folder created

### 6.3 Create Cloud Functions
- [ ] Create `functions/src/setCustomClaims.ts`
- [ ] Copy code from FIREBASE_CLOUD_FUNCTIONS.md
- [ ] Create `functions/src/userTriggers.ts`
- [ ] Copy code from FIREBASE_CLOUD_FUNCTIONS.md
- [ ] Create `functions/src/utils.ts` (optional utility functions)
- [ ] Update `functions/src/index.ts` to export functions

### 6.4 Verify Functions Compile
- [ ] `cd functions && npm run build`
- [ ] No TypeScript errors
- [ ] Check for red squiggles
- [ ] `cd ..`

### 6.5 Update firebase.json
- [ ] Open `firebase.json`
- [ ] Add `"functions"` section with `"source": "functions"`
- [ ] Add `"runtime": "nodejs18"`
- [ ] Save file

### 6.6 Test Locally (Optional)
- [ ] `firebase emulators:start --only functions,auth,firestore`
- [ ] Wait for emulator to start
- [ ] In another terminal, test functions
- [ ] Press Ctrl+C to stop emulator

### 6.7 Deploy Functions
- [ ] `firebase login` (if not already logged in)
- [ ] `firebase use plen-pilot` (select correct project)
- [ ] `firebase deploy --only functions`
- [ ] **Expected:** All functions deployed successfully
- [ ] Verify in Firebase Console → Functions
- [ ] Check function logs: `firebase functions:log`

---

## Phase 7: Custom Claims & Firestore (1 hour)

### 7.1 Enable Firestore
- [ ] In Firebase Console, go to "Firestore Database"
- [ ] Click "Create Database"
- [ ] Location: `eu-west1`
- [ ] Rules: Start in test mode (OK for now)
- [ ] Click "Enable"

### 7.2 Verify onUserCreated Triggered
- [ ] Create new test user in Firebase Console
- [ ] Email: `test@example.com`
- [ ] Password: `test123Secure!`
- [ ] Check `firebase functions:log` for trigger execution
- [ ] Go to Firestore → Collections → `users`
- [ ] **Verify:** New document created with that UID
- [ ] **Check:** Document has email, role fields

### 7.3 Set Admin Role Manually (For Now)
- [ ] In Firestore, edit `admin@plen.no` user document
- [ ] If document doesn't exist, create it:
  - Document ID: `uid-of-admin-user`
  - Fields: `email`, `role`, `createdAt`
- [ ] Update field: `role = "admin"`
- [ ] Click save

### 7.4 Test Custom Claims
- [ ] Login as `admin@plen.no`
- [ ] In browser console, run:
  ```javascript
  firebase.auth().currentUser.getIdTokenResult()
    .then(result => console.log(result.claims))
  ```
- [ ] **Should show:** `{role: "admin"}`

### 7.5 Update Firestore Security Rules
- [ ] In Firebase Console → Firestore → Rules
- [ ] Replace rules with version from FIREBASE_CLOUD_FUNCTIONS.md
- [ ] Click "Publish"
- [ ] **Verify:** No errors

---

## Phase 8: Testing (1 hour)

### 8.1 Manual Test Cases
- [ ] **Test A:** Login as admin
  - [ ] Should see admin-specific features
  - [ ] Role in console: "admin"
- [ ] **Test B:** Login as employee
  - [ ] Should see employee-specific features
  - [ ] Role in console: "employee"
- [ ] **Test C:** Change role in Firestore
  - [ ] Edit user role from "employee" to "admin"
  - [ ] Logout and login
  - [ ] **Verify:** New role reflected in dashboard
- [ ] **Test D:** Session persistence
  - [ ] Login, refresh page multiple times
  - [ ] Should stay logged in
  - [ ] No flash to LoginPage

### 8.2 Error Scenarios
- [ ] Invalid email format
- [ ] Password too short
- [ ] Non-existent user
- [ ] Too many login attempts
- [ ] Network error (simulate by stopping internet)

### 8.3 Browser Compatibility
- [ ] Chrome: All tests pass
- [ ] Firefox: All tests pass
- [ ] Safari: All tests pass (if available)

### 8.4 Mobile Testing
- [ ] Open on mobile device or DevTools mobile mode
- [ ] Login form is responsive
- [ ] Buttons are touch-friendly (> 44px height)
- [ ] No horizontal scrolling

---

## Phase 9: Prepare for Production (30 minutes)

### 9.1 Code Review
- [ ] All changes reviewed
- [ ] No hardcoded credentials
- [ ] Error messages are user-friendly
- [ ] No console.error in production
- [ ] Remove debug logging

### 9.2 Build & Test Production Build
- [ ] `npm run build`
- [ ] Build succeeds with no errors
- [ ] Check `dist/` folder size is reasonable
- [ ] `npm run preview` (test production build locally)
- [ ] Login works in production build

### 9.3 Environment Variables
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` has placeholder values
- [ ] All VITE_FIREBASE_* variables documented
- [ ] No local .env.local should be committed

### 9.4 Git Cleanup
- [ ] All changes committed: `git status` is clean
- [ ] Branches backed up to remote
- [ ] main/master ready for merge
- [ ] No uncommitted changes: `git diff`

---

## Phase 10: Deploy to Production (1 hour)

### 10.1 Final Verification Checklist
- [ ] Type check passes: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in preview
- [ ] All manual tests pass
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] `.env.local` not committed

### 10.2 Deploy to Firebase Hosting
- [ ] `firebase login` (if needed)
- [ ] `firebase use plen-pilot`
- [ ] `npm run build`
- [ ] `firebase deploy --only hosting`
- [ ] Wait for deployment
- [ ] **Verify:** Deployment successful message
- [ ] Check URL in deployment output

### 10.3 Test Production Deployment
- [ ] Open deployed URL in browser
- [ ] **Should see:** LoginPage
- [ ] Test login with `admin@plen.no` / `admin123Secure!`
- [ ] **Should navigate:** AdminDashboard
- [ ] Check browser console: No errors
- [ ] Logout and login again

### 10.4 Monitor Logs
- [ ] Open Firebase Console
- [ ] Go to Functions → Logs
- [ ] Check for any errors
- [ ] Go to Firestore → Logs
- [ ] Check for any permission denied errors

### 10.5 Verify Custom Claims in Production
- [ ] Login to production
- [ ] In console, check custom claims
- [ ] Role should be visible

---

## Phase 11: Post-Deployment (1 hour)

### 11.1 Verify Everything Works
- [ ] Production URL opens
- [ ] Can login with Firebase credentials
- [ ] Session persists
- [ ] Logout works
- [ ] Custom claims visible
- [ ] No errors in Cloud Logging

### 11.2 Setup Monitoring
- [ ] Open Cloud Logging in Firebase Console
- [ ] Set up alerts for errors
- [ ] Check function execution counts
- [ ] Monitor Firestore read/write counts
- [ ] Note: First month free tier usually sufficient

### 11.3 Documentation
- [ ] Update team wiki with production URL
- [ ] Document test user credentials (in secure location)
- [ ] Create runbook for common issues
- [ ] Document rollback procedures

### 11.4 Team Communication
- [ ] Notify team: Migration complete
- [ ] Share production URL
- [ ] Collect feedback from early testers
- [ ] Create channel for bug reports

---

## Post-Migration Tasks (Next Week)

- [ ] Add password reset feature
- [ ] Add email verification
- [ ] Setup analytics
- [ ] Create admin dashboard for user management
- [ ] Audit security rules
- [ ] Monitor costs
- [ ] Plan next features (email notifications, 2FA, etc.)

---

## Rollback Procedures (If Needed)

### Quick Rollback (< 15 min)
1. `git checkout backup/pre-firebase -- src/features/auth/`
2. `git checkout backup/pre-firebase -- src/config/firebase.ts`
3. `rm .env.local`
4. `npm run build`
5. `firebase deploy --only hosting`

### Full Rollback (< 30 min)
1. `git reset --hard backup/pre-firebase`
2. `npm install`
3. `npm run build`
4. `firebase deploy`
5. Verify old system works

---

## Notes & Questions

**Problems encountered:**
```
[Leave space for notes during implementation]
```

**Questions for team:**
```
[Leave space for questions]
```

**What worked well:**
```
[Leave space for retrospective]
```

**What could be improved:**
```
[Leave space for improvements]
```

---

## Sign-Off

- [ ] **Implementer:** _________________ Date: _______
- [ ] **Reviewer:** _________________ Date: _______
- [ ] **Tech Lead Approval:** _________________ Date: _______

---

**This checklist should take 8-12 hours total depending on experience level.**

**Estimated Breakdown:**
- Setup & Config: 1 hour
- Code Changes: 1 hour
- Testing: 2 hours
- Cloud Functions: 2 hours
- Deployment: 1 hour
- Post-Deployment: 1 hour

**Good luck! 🚀**
